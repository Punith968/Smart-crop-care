from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from app.auth.schema import AuthResponse, LoginRequest, RegisterRequest, UserProfile
from app.auth.service import get_current_user, get_token, login_user, logout_user, register_user
from app.crop_recommendation.schema import CropRequest, CropResponse, TopCropsResponse
from app.crop_recommendation.service import predict_crop, predict_top_crops
from app.diseases_detection.schema import DiseaseRequest, DiseaseResponse
from app.diseases_detection.service import detect_disease
from app.fertilizers.schema import FertilizerRequest, FertilizerResponse
from app.fertilizers.service import predict_fertilizer
from app.price_estimation.schema import PriceRequest, PriceResponse
from app.price_estimation.service import estimate_price
from app.reports.schema import ReportCreateRequest, ReportSummary
from app.reports.service import build_performance_analysis_pdf, build_reports_bundle, get_report_download_path, list_reports, save_report
from app.shared.paths import WEB_STATIC_DIR, ensure_storage_dirs
from app.workspace.schema import AdvisoryWorkspaceRequest, DiseaseWorkspaceRequest
from app.workspace.service import run_advisory_workspace, run_disease_workspace

app = FastAPI(title="Farmer Crop Advisory API", version="2.0.0")
ensure_storage_dirs()
app.mount("/static", StaticFiles(directory=WEB_STATIC_DIR), name="static")


@app.get("/", include_in_schema=False)
def web_app() -> FileResponse:
    return FileResponse(WEB_STATIC_DIR / "index.html")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/login", response_model=AuthResponse)
def auth_login(payload: LoginRequest):
    return login_user(payload)


@app.post("/auth/register", response_model=AuthResponse)
def auth_register(payload: RegisterRequest):
    return register_user(payload)


@app.get("/auth/me", response_model=UserProfile)
def auth_me(current_user: dict[str, str] = Depends(get_current_user)):
    return current_user


@app.post("/auth/logout")
def auth_logout(token: str = Depends(get_token)):
    logout_user(token)
    return {"status": "logged_out"}


@app.post("/predict/crop", response_model=CropResponse)
def crop_prediction(payload: CropRequest):
    try:
        return predict_crop(payload)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail="Crop model not trained yet") from exc


@app.post("/predict/crop/top", response_model=TopCropsResponse)
def top_crops_prediction(payload: CropRequest):
    try:
        return predict_top_crops(payload, top_n=4)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail="Crop model not trained yet") from exc


@app.post("/predict/fertilizer", response_model=FertilizerResponse)
def fertilizer_prediction(payload: FertilizerRequest):
    try:
        return predict_fertilizer(payload)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail="Fertilizer model not trained yet") from exc


@app.post("/estimate/price", response_model=PriceResponse)
def price_estimation(payload: PriceRequest):
    return estimate_price(payload)


@app.post("/detect/disease", response_model=DiseaseResponse)
def disease_detection(payload: DiseaseRequest):
    return detect_disease(payload)


@app.post("/workspace/advisory")
def advisory_workspace(payload: AdvisoryWorkspaceRequest):
    try:
        return run_advisory_workspace(payload)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail="One or more models are not trained yet.") from exc


@app.post("/workspace/disease")
def disease_workspace(payload: DiseaseWorkspaceRequest):
    return run_disease_workspace(payload)


@app.post("/reports/save")
def create_report(
    payload: ReportCreateRequest,
    current_user: dict[str, str] = Depends(get_current_user),
):
    return save_report(current_user["username"], payload)


@app.get("/reports", response_model=ReportSummary)
def reports_index(current_user: dict[str, str] = Depends(get_current_user)):
    return list_reports(current_user["username"])


@app.get("/reports/{report_id}/download")
def report_download(
    report_id: str,
    current_user: dict[str, str] = Depends(get_current_user),
):
    report_path = get_report_download_path(current_user["username"], report_id)
    media_type = "application/pdf" if report_path.suffix.lower() == ".pdf" else "text/html"
    return FileResponse(report_path, media_type=media_type, filename=report_path.name)


@app.get("/reports/performance-analysis/download")
def performance_analysis_download(current_user: dict[str, str] = Depends(get_current_user)):
    pdf_bytes = build_performance_analysis_pdf()
    headers = {"Content-Disposition": 'attachment; filename="performance-analysis.pdf"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)


@app.get("/reports/download-all")
def reports_download_all(current_user: dict[str, str] = Depends(get_current_user)):
    zip_bytes = build_reports_bundle(current_user["username"])
    headers = {"Content-Disposition": 'attachment; filename="reports-bundle.zip"'}
    return Response(content=zip_bytes, media_type="application/zip", headers=headers)
