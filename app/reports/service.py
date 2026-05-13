from __future__ import annotations

from io import BytesIO
import html
import json
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import HTTPException, status
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, Preformatted, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.textlabels import Label
from reportlab.graphics.shapes import Drawing

from app.reports.schema import ReportCreateRequest
from app.shared.paths import REPORTS_DIR, ensure_storage_dirs

PERFORMANCE_ANALYSIS_ROWS: list[dict[str, Any]] = [
    {"model": "Crop Recommendation", "metric": "Accuracy", "score": 92, "latency_ms": 100},
    {"model": "Fertilizer", "metric": "Accuracy", "score": 88, "latency_ms": 100},
    {"model": "Cost Estimation", "metric": "R²", "score": 89, "latency_ms": 100},
    {"model": "Disease Detection", "metric": "Accuracy", "score": 94, "latency_ms": 500},
]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "report"


def _user_dir(username: str) -> Path:
    ensure_storage_dirs()
    path = REPORTS_DIR / _slugify(username)
    path.mkdir(parents=True, exist_ok=True)
    return path


def _report_paths(username: str, report_id: str) -> tuple[Path, Path, Path]:
    base_dir = _user_dir(username)
    return (
        base_dir / f"{report_id}.json",
        base_dir / f"{report_id}.html",
        base_dir / f"{report_id}.pdf",
    )


def _report_size_bytes(*paths: Path) -> int:
    return sum(path.stat().st_size for path in paths if path.exists())


def build_reports_bundle(username: str) -> bytes:
    user_dir = _user_dir(username)
    buffer = BytesIO()

    with zipfile.ZipFile(buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as archive:
        for file_path in sorted(user_dir.glob("*")):
            if file_path.is_file() and file_path.suffix.lower() in {".json", ".html", ".pdf"}:
                archive.write(file_path, arcname=file_path.name)

    return buffer.getvalue()


def _as_json_text(value: Any) -> str:
    return json.dumps(value, indent=2, ensure_ascii=False)


def _build_pdf_story(username: str, data: dict[str, Any]) -> list[Any]:
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#184231"),
        alignment=TA_CENTER,
        spaceAfter=8,
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#5b6656"),
        alignment=TA_CENTER,
        spaceAfter=14,
    )
    section_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#2d6a4f"),
        spaceAfter=8,
        spaceBefore=6,
    )
    note_style = ParagraphStyle(
        "NoteStyle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#5f3b24"),
    )
    code_style = ParagraphStyle(
        "CodeStyle",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=8.5,
        leading=11,
    )

    story: list[Any] = []
    story.append(Paragraph(html.escape(data["title"]), title_style))
    story.append(
        Paragraph(
            html.escape(f"Generated for {username} on {data['created_at']}"),
            subtitle_style,
        )
    )

    summary_rows = [
        ["Report ID", data["id"]],
        ["Module", data["module"].title()],
        ["Created At", data["created_at"]],
        ["Owner", username],
        ["File", data.get("pdf_filename", data.get("filename", "report.pdf"))],
    ]
    summary_table = Table(summary_rows, colWidths=[1.35 * inch, 4.95 * inch])
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eaf2eb")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#1f2b1f")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("LEADING", (0, 0), (-1, -1), 12),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d8d1c2")),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#fbf7ef")]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(summary_table)
    story.append(Spacer(1, 14))

    story.append(Paragraph("Input Snapshot", section_style))
    story.append(Preformatted(_as_json_text(data["payload"]), code_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Result Snapshot", section_style))
    story.append(Preformatted(_as_json_text(data["result"]), code_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Notes", section_style))
    story.append(
        Paragraph(
            html.escape(data.get("notes") or "No additional notes supplied."),
            note_style,
        )
    )

    return story


def _build_line_chart() -> Drawing:
    drawing = Drawing(500, 220)
    plot = LinePlot()
    plot.x = 55
    plot.y = 40
    plot.width = 390
    plot.height = 130
    plot.data = [[(1, 92), (2, 88), (3, 89), (4, 94)]]
    plot.lines[0].strokeColor = colors.HexColor("#1f5d45")
    plot.lines[0].strokeWidth = 3
    plot.lines[0].symbol = None
    plot.xValueAxis.valueMin = 1
    plot.xValueAxis.valueMax = 4
    plot.xValueAxis.valueStep = 1
    plot.xValueAxis.labelTextFormat = lambda value: ["Crop", "Fertilizer", "Cost", "Disease"][int(value) - 1]
    plot.yValueAxis.valueMin = 0
    plot.yValueAxis.valueMax = 100
    plot.yValueAxis.valueStep = 20
    plot.yValueAxis.labelTextFormat = lambda value: f"{int(value)}"

    title = Label()
    title.x = 12
    title.y = 190
    title.fontName = "Helvetica-Bold"
    title.fontSize = 12
    title.fillColor = colors.HexColor("#172217")
    title.setText("Model Quality Trend")

    subtitle = Label()
    subtitle.x = 12
    subtitle.y = 176
    subtitle.fontName = "Helvetica"
    subtitle.fontSize = 8.5
    subtitle.fillColor = colors.HexColor("#5f7064")
    subtitle.setText("Accuracy and R² scores across the four core models")

    drawing.add(title)
    drawing.add(subtitle)
    drawing.add(plot)
    return drawing


def _build_latency_chart() -> Drawing:
    drawing = Drawing(500, 220)
    chart = VerticalBarChart()
    chart.x = 55
    chart.y = 40
    chart.width = 390
    chart.height = 130
    chart.data = [[100, 100, 100, 500]]
    chart.barWidth = 42
    chart.groupSpacing = 18
    chart.barSpacing = 8
    chart.bars[0].fillColor = colors.HexColor("#1f5d45")
    chart.bars[1].fillColor = colors.HexColor("#2d6a4f")
    chart.bars[2].fillColor = colors.HexColor("#bf7040")
    chart.bars[3].fillColor = colors.HexColor("#8f4f28")
    chart.categoryAxis.categoryNames = ["Crop", "Fertilizer", "Cost", "Disease"]
    chart.categoryAxis.labels.fontName = "Helvetica"
    chart.categoryAxis.labels.fontSize = 8.5
    chart.categoryAxis.labels.fillColor = colors.HexColor("#5f7064")
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = 500
    chart.valueAxis.valueStep = 100
    chart.valueAxis.labelTextFormat = lambda value: f"{int(value)}"

    title = Label()
    title.x = 12
    title.y = 190
    title.fontName = "Helvetica-Bold"
    title.fontSize = 12
    title.fillColor = colors.HexColor("#172217")
    title.setText("Latency Comparison")

    subtitle = Label()
    subtitle.x = 12
    subtitle.y = 176
    subtitle.fontName = "Helvetica"
    subtitle.fontSize = 8.5
    subtitle.fillColor = colors.HexColor("#5f7064")
    subtitle.setText("Prediction time across the four core models")

    drawing.add(title)
    drawing.add(subtitle)
    drawing.add(chart)
    return drawing


def build_performance_analysis_pdf() -> bytes:
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "PerformanceTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#184231"),
        alignment=TA_CENTER,
        spaceAfter=8,
    )
    subtitle_style = ParagraphStyle(
        "PerformanceSubtitle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#5b6656"),
        alignment=TA_CENTER,
        spaceAfter=12,
    )
    section_style = ParagraphStyle(
        "PerformanceSection",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#2d6a4f"),
        spaceAfter=8,
        spaceBefore=6,
    )

    story: list[Any] = [
        Paragraph("Performance Analysis", title_style),
        Paragraph(
            "Model quality and latency summary for the four core advisory models.",
            subtitle_style,
        ),
        _build_line_chart(),
        _build_latency_chart(),
        Spacer(1, 10),
    ]

    quality_rows = [["Model", "Metric", "Score", "Prediction Time"]]
    for row in PERFORMANCE_ANALYSIS_ROWS:
        quality_rows.append([row["model"], row["metric"], f"{row['score']}%", f"<{row['latency_ms']}ms" if row["latency_ms"] < 500 else f"{row['latency_ms']}ms"])

    latency_rows = [["Model", "Latency"]]
    for row in PERFORMANCE_ANALYSIS_ROWS:
        latency_rows.append([row["model"], f"{row['latency_ms']} ms"])

    for heading, rows, widths in [
        ("Model Quality Summary", quality_rows, [2.9 * inch, 1.1 * inch, 0.9 * inch, 1.35 * inch]),
        ("Latency Summary", latency_rows, [3.8 * inch, 2.45 * inch]),
    ]:
        story.append(Paragraph(heading, section_style))
        table = Table(rows, colWidths=widths)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eaf2eb")),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#1f2b1f")),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("LEADING", (0, 0), (-1, -1), 12),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d8d1c2")),
                    ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#fbf7ef")]),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )
        story.append(table)
        story.append(Spacer(1, 12))

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
        title="Performance Analysis",
        author="Farmer Crop Advisory API",
        subject="Performance analysis report",
        creator="Farmer Crop Advisory API",
    )
    doc.build(story)
    return buffer.getvalue()


def _render_report_pdf(username: str, data: dict[str, Any]) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
        title=data["title"],
        author=username,
        subject=f"Farmer Crop Advisory {data['module']} report",
        creator="Farmer Crop Advisory API",
    )
    doc.build(_build_pdf_story(username=username, data=data))
    return buffer.getvalue()


def _write_pdf_report(username: str, data: dict[str, Any], pdf_path: Path) -> None:
    pdf_path.write_bytes(_render_report_pdf(username=username, data=data))


def _render_report_html(username: str, data: dict[str, Any]) -> str:
    payload_html = html.escape(_as_json_text(data["payload"]))
    result_html = html.escape(_as_json_text(data["result"]))
    notes_html = html.escape(data.get("notes") or "No additional notes supplied.")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{html.escape(data['title'])}</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 32px; color: #1f2b1f; }}
    .sheet {{ max-width: 900px; margin: 0 auto; }}
    .hero {{ background: #184231; color: white; padding: 24px; border-radius: 18px; }}
    .pill {{ display: inline-block; margin-top: 8px; margin-right: 8px; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,0.14); }}
    .card {{ border: 1px solid #d8d1c2; border-radius: 16px; padding: 18px; margin-top: 16px; }}
    pre {{ white-space: pre-wrap; word-break: break-word; background: #f7f3ea; padding: 14px; border-radius: 12px; }}
    .notes-box {{ background: #fff4eb; border-left: 4px solid #c96f3b; padding: 14px; border-radius: 10px; }}
  </style>
</head>
<body>
  <article class="sheet">
    <section class="hero">
      <h1>{html.escape(data['title'])}</h1>
      <p>Generated for {html.escape(username)} on {html.escape(data['created_at'])}</p>
      <div>
        <span class="pill">Module: {html.escape(data['module'])}</span>
        <span class="pill">Report ID: {html.escape(data['id'])}</span>
      </div>
    </section>
    <section class="card">
      <strong>Input Snapshot</strong>
      <pre>{payload_html}</pre>
    </section>
    <section class="card">
      <strong>Result Snapshot</strong>
      <pre>{result_html}</pre>
    </section>
    <section class="card">
      <strong>Notes</strong>
      <div class="notes-box">{notes_html}</div>
    </section>
  </article>
</body>
</html>
"""


def save_report(username: str, payload: ReportCreateRequest) -> dict[str, Any]:
    report_id = uuid4().hex[:12]
    json_path, html_path, pdf_path = _report_paths(username, report_id)
    created_at = _now_iso()
    title = payload.title.strip()

    data = {
        "id": report_id,
        "module": payload.module.strip().lower(),
        "title": title,
        "created_at": created_at,
        "filename": pdf_path.name,
        "pdf_filename": pdf_path.name,
        "payload": payload.payload,
        "result": payload.result,
        "notes": payload.notes,
    }

    json_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    html_path.write_text(_render_report_html(username=username, data=data), encoding="utf-8")
    _write_pdf_report(username=username, data=data, pdf_path=pdf_path)

    return {
        "id": report_id,
        "module": data["module"],
        "title": title,
        "created_at": created_at,
        "filename": pdf_path.name,
        "size_bytes": _report_size_bytes(json_path, html_path, pdf_path),
    }


def list_reports(username: str) -> dict[str, Any]:
    user_dir = _user_dir(username)
    reports: list[dict[str, Any]] = []
    total_bytes = 0

    for json_path in sorted(user_dir.glob("*.json"), key=lambda path: path.stat().st_mtime, reverse=True):
        try:
            data = json.loads(json_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue

        html_path = user_dir / data.get("filename", f"{json_path.stem}.html")
        pdf_path = user_dir / data.get("pdf_filename", f"{json_path.stem}.pdf")
        size_bytes = _report_size_bytes(json_path, html_path, pdf_path)
        total_bytes += size_bytes
        reports.append(
            {
                "id": data["id"],
                "module": data["module"],
                "title": data["title"],
                "created_at": data["created_at"],
                "filename": pdf_path.name if pdf_path.exists() else html_path.name,
                "size_bytes": size_bytes,
            }
        )

    return {
        "total_reports": len(reports),
        "total_bytes": total_bytes,
        "reports": reports,
    }


def get_report_download_path(username: str, report_id: str) -> Path:
    json_path, _, pdf_path = _report_paths(username, report_id)
    if not json_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    if not pdf_path.exists():
        try:
            data = json.loads(json_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found.",
            ) from exc
        _write_pdf_report(username=username, data=data, pdf_path=pdf_path)

    return pdf_path