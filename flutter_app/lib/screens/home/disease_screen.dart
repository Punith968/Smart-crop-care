import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../config/theme/app_theme.dart';
import '../../models/api_models.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/shared_widgets.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Disease Screen — mirrors the web Disease Scan workspace
// ─────────────────────────────────────────────────────────────────────────────

class DiseaseScreen extends ConsumerStatefulWidget {
  const DiseaseScreen({super.key});
  @override
  ConsumerState<DiseaseScreen> createState() => _DiseaseScreenState();
}

class _DiseaseScreenState extends ConsumerState<DiseaseScreen> {
  final _cropCtrl = TextEditingController(text: 'tomato');
  bool _loading = false;
  String _status =
      'Upload a leaf image or enter a crop name to start the scan.';
  bool _isError = false;
  DiseaseWorkspaceResult? _result;
  XFile? _imageFile;

  @override
  void dispose() {
    _cropCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final file = await ImagePicker()
        .pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (file != null) {
      setState(() {
        _imageFile = file;
        _isError = false;
        _status =
            'Leaf image selected. For best results, use a clear close-up of a single leaf. Other photos may produce unreliable results.';
      });
    }
  }

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _status = 'Analyzing diagnostic signals...';
      _isError = false;
    });
    try {
      String? imageData;
      if (_imageFile != null) {
        final bytes = await _imageFile!.readAsBytes();
        imageData = base64Encode(bytes);
      }
      final result = await ref.read(apiServiceProvider).runDisease(
          DiseaseWorkspaceRequest(
              cropName: _cropCtrl.text.trim(), imageData: imageData));
      setState(() {
        _loading = false;
        _result = result;
        _status = 'Disease analysis completed.';
      });
    } catch (e) {
      setState(() {
        _loading = false;
        _status = e.toString();
        _isError = true;
      });
    }
  }

  Future<void> _saveReport() async {
    final result = _result;
    if (result == null) return;
    setState(() {
      _status = 'Saving diagnostic report to vault...';
      _isError = false;
    });
    try {
      await ref.read(apiServiceProvider).saveReport(ReportCreateRequest(
            module: 'disease',
            title: 'Disease report - ${fcaTitleCase(result.cropName)}',
            payload: {'crop_name': result.cropName},
            result: {
              'crop_name': result.cropName,
              'likely_disease': result.likelyDisease,
              'recommendation': result.recommendation,
              'justification': result.justification,
              'prediction_source': result.predictionSource
            },
            notes: 'Generated from the disease diagnostics workspace.',
          ));
      setState(() => _status = 'Diagnostic report saved to vault.');
    } catch (e) {
      setState(() {
        _status = e.toString();
        _isError = true;
      });
    }
  }

  void _clear() {
    setState(() {
      _cropCtrl.text = 'tomato';
      _imageFile = null;
      _result = null;
      _status = 'Disease intake cleared.';
      _isError = false;
    });
  }

  int _riskScore(String disease) {
    final d = disease.toLowerCase();
    if (d.contains('blight') || d.contains('wilt') || d.contains('rot')) {
      return 78;
    }
    if (d.contains('spot') || d.contains('rust') || d.contains('mold')) {
      return 55;
    }
    if (d.contains('healthy') || d.contains('none')) {
      return 10;
    }
    return 42;
  }

  String _severity(int score) {
    if (score >= 70) return 'High severity';
    if (score >= 40) return 'Moderate severity';
    return 'Low severity';
  }

  String _getPredictionSourceLabel(String source) {
    switch (source) {
      case 'heuristic_leaf_fallback':
        return 'Heuristic Analysis (image-based)';
      case 'resnet50_cnn':
      case 'resnet50_cnn+heatmap_features':
        return 'AI Model (trained on crop diseases)';
      case 'leaf_guard':
        return 'Image Rejected';
      case 'fallback':
        return 'Generic Recommendation';
      default:
        return source;
    }
  }

  List<Map<String, String>> _actions(DiseaseWorkspaceResult r) => [
        {'title': 'Immediate action', 'detail': r.recommendation},
        if (r.justification.trim().isNotEmpty)
          {'title': 'Technical basis', 'detail': r.justification},
        {'title': 'Prediction source', 'detail': r.predictionSource},
        {
          'title': 'Vault integration',
          'detail': 'Save this run to generate a downloadable HTML report.'
        },
      ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accent = isDark ? AppTheme.clayDark : AppTheme.clay;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Input panel ───────────────────────────────────────────
          FcaPanelCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const FcaPanelHeader(
                  eyebrow: 'DIAGNOSTIC INTAKE',
                  title: 'Disease scan',
                  subtitle:
                      'Upload a leaf image or enter a crop name to diagnose.',
                ),
                const SizedBox(height: 20),

                // Image upload area
                GestureDetector(
                  onTap: _pickImage,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    height: 180,
                    decoration: BoxDecoration(
                      gradient: _imageFile == null
                          ? LinearGradient(
                              begin: Alignment.topRight,
                              end: Alignment.bottomLeft,
                              colors: isDark
                                  ? [
                                      const Color(0x0CFFFFFF),
                                      const Color(0x06FFFFFF)
                                    ]
                                  : [
                                      const Color(0x14DFB872),
                                      const Color(0x0CF5EBE0)
                                    ],
                            )
                          : null,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isDark
                            ? const Color(0x20FFFFFF)
                            : const Color(0x30B86D41),
                        style: _imageFile == null
                            ? BorderStyle.solid
                            : BorderStyle.solid,
                        width: 1.5,
                      ),
                    ),
                    child: _imageFile != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(20),
                            child: FutureBuilder<Uint8List>(
                              future: _imageFile!.readAsBytes(),
                              builder: (ctx, snap) {
                                if (snap.hasData) {
                                  return Stack(
                                    fit: StackFit.expand,
                                    children: [
                                      Image.memory(snap.data!,
                                          fit: BoxFit.cover),
                                      Positioned(
                                        bottom: 10,
                                        right: 10,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 10, vertical: 5),
                                          decoration: BoxDecoration(
                                            color: Colors.black54,
                                            borderRadius:
                                                BorderRadius.circular(20),
                                          ),
                                          child: Text(_imageFile!.name,
                                              style: const TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.w700),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis),
                                        ),
                                      ),
                                    ],
                                  );
                                }
                                return const Center(
                                    child: CircularProgressIndicator());
                              },
                            ),
                          )
                        : Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                width: 52,
                                height: 52,
                                decoration: BoxDecoration(
                                  color: accent.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Icon(Icons.add_photo_alternate_outlined,
                                    size: 28, color: accent),
                              ),
                              const SizedBox(height: 10),
                              Text('Tap to upload leaf image',
                                  style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                      color: isDark
                                          ? AppTheme.textDark
                                          : AppTheme.textLight)),
                              const SizedBox(height: 4),
                              Text('Image-assisted CNN diagnostics',
                                  style: Theme.of(context).textTheme.bodySmall),
                            ],
                          ),
                  ),
                ),
                const SizedBox(height: 16),

                if (_imageFile != null) ...[
                  const FcaStatusBanner(
                    message:
                        'Leaf photos give the best diagnosis. If this is not a leaf image, please choose a clear single-leaf photo for accurate results.',
                    isError: false,
                  ),
                  const SizedBox(height: 12),
                ],

                // Crop name
                TextFormField(
                  controller: _cropCtrl,
                  decoration: const InputDecoration(
                    labelText: 'CROP NAME',
                    prefixIcon: Icon(Icons.grass_outlined, size: 18),
                  ),
                ),
                const SizedBox(height: 20),

                // Actions
                ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: accent,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18)),
                  ),
                  child: _loading
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : const Text('Analyze disease',
                          style: TextStyle(
                              fontSize: 15, fontWeight: FontWeight.w800)),
                ),
                const SizedBox(height: 10),
                Row(children: [
                  Expanded(
                      child: OutlinedButton(
                    onPressed: _result != null ? _saveReport : null,
                    style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14)),
                    child: const Text('Save report'),
                  )),
                  const SizedBox(width: 10),
                  Expanded(
                      child: OutlinedButton(
                    onPressed: _clear,
                    style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14)),
                    child: const Text('Clear intake'),
                  )),
                ]),
                const SizedBox(height: 14),
                FcaStatusBanner(message: _status, isError: _isError),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // ── Results ───────────────────────────────────────────────
          if (_result != null) ...[
            // Diagnosis hero card (berry/clay gradient)
            FcaDiseaseHeroCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (_result!.predictionSource == 'leaf_guard') ...[
                    const FcaStatusBanner(
                      message:
                          'This image is not leaf-like enough for diagnosis. Please upload a clear close-up of a single leaf instead of an architecture or scene photo.',
                      isError: true,
                    ),
                    const SizedBox(height: 14),
                  ],

                  // Alert bar
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                          _severity(_riskScore(_result!.likelyDisease))
                              .toUpperCase(),
                          style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.2,
                              color: Color(0xCCFFFFFF))),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0x18FFFFFF),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: const Color(0x18FFFFFF)),
                        ),
                        child: const Text('Active scan',
                            style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                                color: Colors.white)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // Disease + confidence
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('LIKELY DISEASE',
                                style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 1.2,
                                    color: Color(0xBBFFFFFF))),
                            const SizedBox(height: 6),
                            Text(fcaTitleCase(_result!.likelyDisease),
                                style: const TextStyle(
                                    fontSize: 30,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                    height: 1,
                                    letterSpacing: -0.5)),
                            const SizedBox(height: 8),
                            Text(_result!.recommendation,
                                style: const TextStyle(
                                    fontSize: 13,
                                    color: Color(0xCCFFFFFF),
                                    height: 1.5)),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: const Color(0x18FFFFFF),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0x18FFFFFF)),
                        ),
                        child: Column(children: [
                          const Text('RISK',
                              style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1.2,
                                  color: Color(0xBBFFFFFF))),
                          const SizedBox(height: 4),
                          Text('${_riskScore(_result!.likelyDisease)}',
                              style: const TextStyle(
                                  fontSize: 32,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white)),
                          const Text('/100',
                              style: TextStyle(
                                  fontSize: 12,
                                  color: Color(0xAAFFFFFF),
                                  fontWeight: FontWeight.w700)),
                        ]),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Action plan + risk details (2 columns)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: FcaPanelCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const FcaSectionHead(label: 'Action plan'),
                        const SizedBox(height: 4),
                        Text('Recommended remediation steps',
                            style: Theme.of(context).textTheme.bodySmall),
                        const SizedBox(height: 14),
                        ..._actions(_result!).take(2).map((a) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: FcaNoteItem(
                                  title: a['title']!, detail: a['detail']!),
                            )),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: FcaPanelCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const FcaSectionHead(label: 'Diagnostic details'),
                        const SizedBox(height: 4),
                        Text('Technical justification and source',
                            style: Theme.of(context).textTheme.bodySmall),
                        if (_result!.predictionSource == 'leaf_guard') ...[
                          const SizedBox(height: 10),
                          const FcaStatusBanner(
                            message:
                                'No technical justification is shown because the upload is not a leaf photo.',
                            isError: true,
                          ),
                        ],
                        const SizedBox(height: 14),
                        FcaMetricTile(
                            label: 'Crop',
                            value: fcaTitleCase(_result!.cropName)),
                        const SizedBox(height: 8),
                        FcaMetricTile(
                            label: 'Analysis method',
                            value: _getPredictionSourceLabel(
                                _result!.predictionSource)),
                        const SizedBox(height: 12),
                        if (_result!.justification.trim().isNotEmpty) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isDark
                                  ? const Color(0x0CFFFFFF)
                                  : const Color(0x0C324338),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Text(_result!.justification,
                                style: Theme.of(context).textTheme.bodySmall),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ] else
            FcaPanelCard(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Column(
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppTheme.berry, AppTheme.clay],
                        ),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: const Icon(Icons.biotech_outlined,
                          size: 36, color: Colors.white),
                    ),
                    const SizedBox(height: 18),
                    Text('Disease Scan',
                        style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 8),
                    Text(
                      'Upload a leaf image and enter the crop name\nto run the disease diagnostic.',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
