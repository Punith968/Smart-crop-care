import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../config/theme/app_theme.dart';
import '../../models/api_models.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/shared_widgets.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Reports Screen — mirrors the web Report Vault
// ─────────────────────────────────────────────────────────────────────────────

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});
  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen> {
  bool _loading = false;
  String _status = 'Loading reports...';
  bool _isError = false;
  ReportSummary? _summary;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _status = 'Loading reports...';
      _isError = false;
    });
    try {
      final summary = await ref.read(apiServiceProvider).listReports();
      if (!mounted) return;
      setState(() {
        _loading = false;
        _summary = summary;
        _status = '${summary.totalReports} report(s) in vault.';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _status = e.toString();
        _isError = true;
      });
    }
  }

  Future<void> _download(String reportId) async {
    final url = ref.read(apiServiceProvider).reportDownloadUrl(reportId);
    final uri = Uri.parse(url);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (!mounted) return;
        setState(() {
          _status = 'Cannot open: $url';
          _isError = true;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _status = e.toString();
        _isError = true;
      });
    }
  }

  String _bytes(int b) {
    if (b < 1024) return '$b B';
    if (b < 1024 * 1024) return '${(b / 1024).toStringAsFixed(1)} KB';
    return '${(b / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  String _date(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      return '${dt.day}/${dt.month}/${dt.year}  ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return iso;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primary = isDark ? AppTheme.forestDark : AppTheme.forest;
    final reports = _summary?.reports ?? [];
    final advisory = reports.where((r) => r.module == 'advisory').toList();
    final disease = reports.where((r) => r.module == 'disease').toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Vault summary card ────────────────────────────────────
          FcaPanelCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const FcaPanelHeader(
                  eyebrow: 'STORAGE VAULT',
                  title: 'Saved reports',
                  subtitle:
                      'Advisory and disease runs stored as downloadable PDF reports.',
                ),
                const SizedBox(height: 18),
                Row(children: [
                  Expanded(
                      child: FcaMetricTile(
                          label: 'Total reports',
                          value: '${_summary?.totalReports ?? 0}')),
                  const SizedBox(width: 8),
                  Expanded(
                      child: FcaMetricTile(
                          label: 'Storage used',
                          value: _bytes(_summary?.totalBytes ?? 0))),
                  const SizedBox(width: 8),
                  Expanded(
                      child: FcaMetricTile(
                          label: 'Advisory', value: '${advisory.length}')),
                  const SizedBox(width: 8),
                  Expanded(
                      child: FcaMetricTile(
                          label: 'Disease', value: '${disease.length}')),
                ]),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: _loading ? null : _load,
                  style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(18))),
                  icon: _loading
                      ? const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.refresh_rounded, size: 18),
                  label: const Text('Refresh vault',
                      style: TextStyle(fontWeight: FontWeight.w800)),
                ),
                const SizedBox(height: 12),
                FcaStatusBanner(message: _status, isError: _isError),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ── Empty state ───────────────────────────────────────────
          if (reports.isEmpty && !_loading)
            FcaPanelCard(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Column(
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        gradient:
                            LinearGradient(colors: [primary, AppTheme.clay]),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: const Icon(Icons.folder_open_outlined,
                          size: 36, color: Colors.white),
                    ),
                    const SizedBox(height: 18),
                    Text('No reports stored yet',
                        style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 8),
                    Text(
                      'Save an advisory or diagnostic result\nto build the report vault.',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            )
          else ...[
            // Advisory reports section
            if (advisory.isNotEmpty) ...[
              _SectionLabel(
                  label: 'Advisory reports',
                  count: advisory.length,
                  color: primary),
              const SizedBox(height: 10),
              ...advisory.map((r) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _ReportCard(
                        report: r,
                        color: primary,
                        onDownload: () => _download(r.id),
                        bytes: _bytes(r.sizeBytes),
                        date: _date(r.createdAt)),
                  )),
              const SizedBox(height: 8),
            ],
            // Disease reports section
            if (disease.isNotEmpty) ...[
              _SectionLabel(
                  label: 'Disease reports',
                  count: disease.length,
                  color: AppTheme.clay),
              const SizedBox(height: 10),
              ...disease.map((r) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _ReportCard(
                        report: r,
                        color: AppTheme.clay,
                        onDownload: () => _download(r.id),
                        bytes: _bytes(r.sizeBytes),
                        date: _date(r.createdAt)),
                  )),
            ],
          ],
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Local widgets
// ─────────────────────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(
      {required this.label, required this.count, required this.color});
  final String label;
  final int count;
  final Color color;

  @override
  Widget build(BuildContext context) => Row(
        children: [
          Container(
            width: 4,
            height: 20,
            decoration: BoxDecoration(
                color: color, borderRadius: BorderRadius.circular(2)),
          ),
          const SizedBox(width: 10),
          Text(label, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text('$count',
                style: TextStyle(
                    fontSize: 11, fontWeight: FontWeight.w800, color: color)),
          ),
        ],
      );
}

class _ReportCard extends StatelessWidget {
  const _ReportCard({
    required this.report,
    required this.color,
    required this.onDownload,
    required this.bytes,
    required this.date,
  });
  final ReportEntry report;
  final Color color;
  final VoidCallback onDownload;
  final String bytes;
  final String date;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return FcaPanelCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Pills row
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              _Pill(label: fcaTitleCase(report.module), color: color),
              _Pill(
                  label: date,
                  color: isDark ? AppTheme.mutedDark : AppTheme.mutedLight),
              _Pill(
                  label: bytes,
                  color: isDark ? AppTheme.mutedDark : AppTheme.mutedLight),
            ],
          ),
          const SizedBox(height: 10),
          Text(report.title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 4),
          Text('Stored as ${report.filename}',
              style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 14),
          ElevatedButton.icon(
            onPressed: onDownload,
            style: ElevatedButton.styleFrom(
              backgroundColor: color,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
            ),
            icon: const Icon(Icons.download_rounded, size: 16),
            label: const Text('Download PDF',
                style: TextStyle(fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.label, required this.color});
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Text(label,
            style: TextStyle(
                fontSize: 11, fontWeight: FontWeight.w700, color: color)),
      );
}
