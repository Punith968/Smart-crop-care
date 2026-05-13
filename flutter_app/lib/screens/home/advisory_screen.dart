import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme/app_theme.dart';
import '../../models/api_models.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/shared_widgets.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Advisory Screen — mirrors the web Advisory Lab workspace
// ─────────────────────────────────────────────────────────────────────────────

class AdvisoryScreen extends ConsumerStatefulWidget {
  const AdvisoryScreen({super.key});
  @override
  ConsumerState<AdvisoryScreen> createState() => _AdvisoryScreenState();
}

class _AdvisoryScreenState extends ConsumerState<AdvisoryScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;
  String _status = 'Waiting for field input.';
  bool _isError = false;
  AdvisoryWorkspaceResult? _result;
  AdvisoryWorkspaceRequest? _lastPayload;
  String? _savedReportId;

  String _soilType = 'Sandy';
  final _nCtrl = TextEditingController(text: '90');
  final _pCtrl = TextEditingController(text: '42');
  final _kCtrl = TextEditingController(text: '43');
  final _tempCtrl = TextEditingController(text: '25');
  final _humCtrl = TextEditingController(text: '80');
  final _rainCtrl = TextEditingController(text: '200');
  final _moistCtrl = TextEditingController(text: '38');
  final _acresCtrl = TextEditingController(text: '2.5');
  double _ph = 6.5;

  static const _soilTypes = ['Sandy', 'Loamy', 'Clayey', 'Black', 'Red'];
  static const _soilSubs = {
    'Sandy': 'Fast draining',
    'Loamy': 'Balanced texture',
    'Clayey': 'High retention',
    'Black': 'Rich organic base',
    'Red': 'Mineral heavy',
  };

  @override
  void dispose() {
    for (final c in [
      _nCtrl,
      _pCtrl,
      _kCtrl,
      _tempCtrl,
      _humCtrl,
      _rainCtrl,
      _moistCtrl,
      _acresCtrl
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _status = 'Running crop, fertilizer, and cost models...';
      _isError = false;
    });
    try {
      final api = ref.read(apiServiceProvider);
      final req = AdvisoryWorkspaceRequest(
        N: double.parse(_nCtrl.text),
        P: double.parse(_pCtrl.text),
        K: double.parse(_kCtrl.text),
        temperature: double.parse(_tempCtrl.text),
        humidity: double.parse(_humCtrl.text),
        ph: _ph,
        rainfall: double.parse(_rainCtrl.text),
        moisture: double.parse(_moistCtrl.text),
        soilType: _soilType,
        acres: double.parse(_acresCtrl.text),
      );
      final result = await api.runAdvisory(req);
      setState(() {
        _loading = false;
        _result = result;
        _lastPayload = req;
        _status = 'Advisory generated successfully.';
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
    final payload = _lastPayload;
    if (result == null || payload == null) return;
    setState(() {
      _status = 'Saving advisory report to vault...';
      _isError = false;
    });
    try {
      final api = ref.read(apiServiceProvider);
      final saved = await api.saveReport(ReportCreateRequest(
        module: 'advisory',
        title: 'Advisory report - ${fcaTitleCase(result.crop.recommendedCrop)}',
        payload: payload.toJson(),
        result: {
          'crop': {'recommended_crop': result.crop.recommendedCrop},
          'fertilizer': {
            'recommended_fertilizer': result.fertilizer.recommendedFertilizer
          },
          'price': {
            'expected_profit': result.price.expectedProfit,
            'total_cost': result.price.totalCost,
            'expected_revenue': result.price.expectedRevenue,
            'cost_per_acre': result.price.costPerAcre,
            'profit_margin': result.price.profitMargin,
            'prediction_source': result.price.predictionSource
          },
          'summary': {
            'headline': result.summary.headline,
            'profit_signal': result.summary.profitSignal
          },
        },
        notes: 'Generated from the advisory dashboard workspace.',
      ));
      setState(() {
        _savedReportId = saved.id;
        _status = 'Report saved. Review it in the vault.';
      });
    } catch (e) {
      setState(() {
        _status = e.toString();
        _isError = true;
      });
    }
  }

  void _applyPreset() {
    const presets = {
      'Sandy': (
        N: 60.0,
        P: 30.0,
        K: 20.0,
        temp: 28.0,
        hum: 65.0,
        rain: 120.0,
        moist: 28.0,
        ph: 6.2,
        acres: 2.0
      ),
      'Loamy': (
        N: 90.0,
        P: 42.0,
        K: 43.0,
        temp: 25.0,
        hum: 80.0,
        rain: 200.0,
        moist: 38.0,
        ph: 6.5,
        acres: 2.5
      ),
      'Clayey': (
        N: 80.0,
        P: 55.0,
        K: 38.0,
        temp: 24.0,
        hum: 85.0,
        rain: 220.0,
        moist: 48.0,
        ph: 6.8,
        acres: 3.0
      ),
      'Black': (
        N: 70.0,
        P: 35.0,
        K: 50.0,
        temp: 27.0,
        hum: 70.0,
        rain: 160.0,
        moist: 42.0,
        ph: 7.2,
        acres: 4.0
      ),
      'Red': (
        N: 50.0,
        P: 25.0,
        K: 30.0,
        temp: 30.0,
        hum: 60.0,
        rain: 100.0,
        moist: 25.0,
        ph: 5.8,
        acres: 1.5
      ),
    };
    final p = presets[_soilType] ?? presets['Loamy']!;
    setState(() {
      _nCtrl.text = p.N.toString();
      _pCtrl.text = p.P.toString();
      _kCtrl.text = p.K.toString();
      _tempCtrl.text = p.temp.toString();
      _humCtrl.text = p.hum.toString();
      _rainCtrl.text = p.rain.toString();
      _moistCtrl.text = p.moist.toString();
      _acresCtrl.text = p.acres.toString();
      _ph = p.ph;
      _status = 'Smart preset applied for $_soilType soil.';
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primary = isDark ? AppTheme.forestDark : AppTheme.forest;
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── KPI strip ─────────────────────────────────────────────
          const Row(children: [
            _KpiChip(label: 'Mode', value: 'Field calibration'),
            SizedBox(width: 8),
            _KpiChip(label: 'Engine', value: 'ML assisted'),
            SizedBox(width: 8),
            _KpiChip(label: 'Output', value: 'Report ready'),
          ]),
          const SizedBox(height: 14),

          // ── Input panel ───────────────────────────────────────────
          FcaPanelCard(
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const FcaPanelHeader(
                    eyebrow: 'INPUT WORKSPACE',
                    title: 'Farm parameters',
                    subtitle:
                        'Soil chemistry, field conditions, and crop scale.',
                  ),
                  const SizedBox(height: 20),

                  // Soil chips
                  _FormSection(
                    title: 'Soil classification',
                    subtitle: 'Choose the field profile closest to your land',
                    child: GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 2.8,
                      children: _soilTypes
                          .map((s) => _SoilChip(
                                label: s,
                                sub: _soilSubs[s] ?? '',
                                active: _soilType == s,
                                onTap: () => setState(() => _soilType = s),
                              ))
                          .toList(),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // NPK
                  _FormSection(
                    title: 'Soil chemistry',
                    subtitle: 'NPK values and pH balance',
                    child: Column(
                      children: [
                        Row(children: [
                          Expanded(
                              child:
                                  _NumField(ctrl: _nCtrl, label: 'Nitrogen')),
                          const SizedBox(width: 10),
                          Expanded(
                              child:
                                  _NumField(ctrl: _pCtrl, label: 'Phosphorus')),
                          const SizedBox(width: 10),
                          Expanded(
                              child:
                                  _NumField(ctrl: _kCtrl, label: 'Potassium')),
                        ]),
                        const SizedBox(height: 16),
                        // pH panel
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: isDark
                                  ? [
                                      const Color(0x147BD0A7),
                                      const Color(0x14C9A07D)
                                    ]
                                  : [
                                      const Color(0x0C123D2D),
                                      const Color(0x1CDFBC72)
                                    ],
                            ),
                            borderRadius: BorderRadius.circular(18),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text('HYDROGEN POTENTIAL',
                                          style: TextStyle(
                                              fontSize: 9,
                                              fontWeight: FontWeight.w800,
                                              letterSpacing: 1.2,
                                              color: isDark
                                                  ? AppTheme.mutedDark
                                                  : AppTheme.mutedLight)),
                                      Text(_ph.toStringAsFixed(1),
                                          style: TextStyle(
                                              fontSize: 32,
                                              fontWeight: FontWeight.w900,
                                              color: isDark
                                                  ? AppTheme.forestDark
                                                  : AppTheme.forestStrong,
                                              height: 1.1)),
                                      Text(fcaPhTone(_ph),
                                          style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w700,
                                              color: isDark
                                                  ? AppTheme.clayDark
                                                  : AppTheme.clayDeep)),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              SliderTheme(
                                data: SliderTheme.of(context).copyWith(
                                  trackHeight: 8,
                                  thumbShape: const RoundSliderThumbShape(
                                      enabledThumbRadius: 10),
                                  overlayShape: const RoundSliderOverlayShape(
                                      overlayRadius: 18),
                                  activeTrackColor: primary,
                                  inactiveTrackColor: isDark
                                      ? const Color(0x20FFFFFF)
                                      : const Color(0x20324338),
                                  thumbColor: primary,
                                ),
                                child: Slider(
                                    value: _ph,
                                    min: 4,
                                    max: 10,
                                    divisions: 60,
                                    onChanged: (v) => setState(() => _ph = v)),
                              ),
                              Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('Acidic',
                                        style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w800,
                                            color: isDark
                                                ? AppTheme.mutedDark
                                                : AppTheme.mutedLight)),
                                    Text('Neutral',
                                        style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w800,
                                            color: isDark
                                                ? AppTheme.mutedDark
                                                : AppTheme.mutedLight)),
                                    Text('Alkaline',
                                        style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w800,
                                            color: isDark
                                                ? AppTheme.mutedDark
                                                : AppTheme.mutedLight)),
                                  ]),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Field conditions
                  _FormSection(
                    title: 'Field conditions',
                    subtitle: 'Environmental inputs',
                    child: Column(children: [
                      Row(children: [
                        Expanded(
                            child: _NumField(
                                ctrl: _tempCtrl, label: 'Temperature')),
                        const SizedBox(width: 10),
                        Expanded(
                            child:
                                _NumField(ctrl: _humCtrl, label: 'Humidity')),
                      ]),
                      const SizedBox(height: 10),
                      Row(children: [
                        Expanded(
                            child:
                                _NumField(ctrl: _rainCtrl, label: 'Rainfall')),
                        const SizedBox(width: 10),
                        Expanded(
                            child:
                                _NumField(ctrl: _moistCtrl, label: 'Moisture')),
                      ]),
                    ]),
                  ),
                  const SizedBox(height: 14),

                  // Acres
                  _FormSection(
                    title: 'Crop scale',
                    subtitle: 'Land size for financial projection',
                    child: _NumField(ctrl: _acresCtrl, label: 'Acres'),
                  ),
                  const SizedBox(height: 20),

                  // Actions
                  ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    style: ElevatedButton.styleFrom(
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
                        : const Text('Initiate recommendation',
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
                      onPressed: _applyPreset,
                      style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14)),
                      child: const Text('Smart preset'),
                    )),
                  ]),
                  const SizedBox(height: 14),
                  FcaStatusBanner(message: _status, isError: _isError),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // ── Results ───────────────────────────────────────────────
          if (_result != null)
            _AdvisoryResults(result: _result!, savedReportId: _savedReportId)
          else
            _AdvisoryPlaceholder(),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Advisory Results — mirrors the web results panel
// ─────────────────────────────────────────────────────────────────────────────

class _AdvisoryResults extends StatelessWidget {
  const _AdvisoryResults({required this.result, this.savedReportId});
  final AdvisoryWorkspaceResult result;
  final String? savedReportId;

  int _readiness() {
    final margin = result.price.profitMargin;
    final roi = result.price.totalCost > 0
        ? result.price.expectedProfit / result.price.totalCost
        : 0.0;
    return ((0.5 + margin * 0.3 + roi * 0.2).clamp(0.18, 0.98) * 100).round();
  }

  int _confidence() => (_readiness() * 0.82 + 14).round().clamp(58, 97);

  String _fieldSignal() {
    final r = _readiness();
    if (r >= 84) return 'Prime opportunity';
    if (r >= 70) return 'Strong alignment';
    if (r >= 56) return 'Balanced — watch inputs';
    return 'Needs calibration';
  }

  List<Map<String, String>> _alternatives() {
    const crops = ['Rice', 'Maize', 'Cotton', 'Sugarcane', 'Wheat', 'Tobacco'];
    final rec = fcaTitleCase(result.crop.recommendedCrop);
    return crops.where((c) => c != rec).take(3).map((c) {
      const reasons = {
        'Rice': 'Works well when soil retains moisture effectively.',
        'Cotton':
            'Solid backup when moisture is moderate and drainage consistent.',
        'Sugarcane': 'Higher-volume crop for longer growth cycles.',
        'Wheat': 'Good fallback for cooler seasonal windows.',
        'Tobacco':
            'Suits mineral-heavy profiles with careful moisture management.',
        'Maize': 'Versatile crop adaptable to most soil profiles.',
      };
      return {
        'crop': c,
        'reason':
            reasons[c] ?? 'Practical alternative for current nutrient range.'
      };
    }).toList();
  }

  List<Map<String, String>> _fertPlan() {
    final fert = result.fertilizer.recommendedFertilizer;
    return [
      {
        'title': 'Base application',
        'detail': 'Apply $fert at sowing time for root establishment.'
      },
      {
        'title': 'Top dressing',
        'detail': 'Split remaining dose at 30 and 60 days after sowing.'
      },
      {
        'title': 'Foliar spray',
        'detail': 'Use micronutrient mix if leaf yellowing is observed.'
      },
    ];
  }

  List<Map<String, String>> _insights() {
    final r = _readiness();
    return [
      {'title': 'Field readiness: $r%', 'detail': _fieldSignal()},
      {'title': 'Profit signal', 'detail': result.summary.profitSignal},
      {
        'title': 'Revenue estimate',
        'detail':
            'Expected ${fcaMoney(result.price.expectedRevenue)} from this run.'
      },
      {
        'title': 'Cost efficiency',
        'detail':
            '${fcaMoney(result.price.costPerAcre)} per acre — review if above regional average.'
      },
    ];
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primary = isDark ? AppTheme.forestDark : AppTheme.forest;
    final readiness = _readiness();
    final confidence = _confidence();
    final signal = _fieldSignal();
    final alts = _alternatives();
    final plan = _fertPlan();
    final insights = _insights();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // ── Hero result card (dark gradient) ──────────────────────
        FcaHeroCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              FcaPanelHeader(
                eyebrow: 'ADVISORY OUTPUT',
                title: signal,
                subtitle: result.summary.headline,
                light: true,
              ),
              const SizedBox(height: 20),

              // Crop name + confidence
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('TOP RECOMMENDED CROP',
                            style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.2,
                                color: Color(0xBBFFFFFF))),
                        const SizedBox(height: 6),
                        Text(
                          fcaTitleCase(result.crop.recommendedCrop),
                          style: const TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              height: 1,
                              letterSpacing: -1),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 18, vertical: 14),
                    decoration: BoxDecoration(
                      color: const Color(0x18FFFFFF),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0x18FFFFFF)),
                    ),
                    child: Column(children: [
                      const Text('MODEL FIT',
                          style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.2,
                              color: Color(0xBBFFFFFF))),
                      const SizedBox(height: 6),
                      Text('$confidence%',
                          style: const TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w900,
                              color: Colors.white)),
                    ]),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Summary band
              Row(children: [
                Expanded(
                    child: FcaMetricTile(
                        label: 'Fertilizer pair',
                        value: result.fertilizer.recommendedFertilizer,
                        light: true)),
                const SizedBox(width: 8),
                Expanded(
                    child: FcaMetricTile(
                        label: 'Expected profit',
                        value: fcaMoney(result.price.expectedProfit),
                        light: true)),
                const SizedBox(width: 8),
                Expanded(
                    child: FcaMetricTile(
                        label: 'Recommendation', value: signal, light: true)),
              ]),
              const SizedBox(height: 16),

              // Alternative crops
              const Text('ALTERNATIVE CROPS',
                  style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                      color: Color(0xBBFFFFFF))),
              const SizedBox(height: 8),
              Row(
                  children: alts
                      .map((a) => Expanded(
                            child: Padding(
                              padding: EdgeInsets.only(
                                  right: a == alts.last ? 0 : 8),
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0x14FFFFFF),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                      color: const Color(0x14FFFFFF)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text('Alternative',
                                        style: TextStyle(
                                            fontSize: 9,
                                            color: Color(0xAAFFFFFF),
                                            fontWeight: FontWeight.w700)),
                                    const SizedBox(height: 4),
                                    Text(a['crop']!,
                                        style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w800,
                                            color: Colors.white)),
                                    const SizedBox(height: 3),
                                    Text(a['reason']!,
                                        style: const TextStyle(
                                            fontSize: 10,
                                            color: Color(0xAAFFFFFF)),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis),
                                  ],
                                ),
                              ),
                            ),
                          ))
                      .toList()),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // ── Insight grid (2 columns) ───────────────────────────────
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left column
            Expanded(
              child: Column(
                children: [
                  // Fertilizer plan
                  FcaPanelCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const FcaSectionHead(label: 'Application plan'),
                        const SizedBox(height: 4),
                        Text('Suggested fertilizer deployment pattern',
                            style: Theme.of(context).textTheme.bodySmall),
                        const SizedBox(height: 14),
                        ...plan.map((p) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: FcaNoteItem(
                                  title: p['title']!, detail: p['detail']!),
                            )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Field readiness
                  FcaPanelCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const FcaSectionHead(label: 'Field readiness'),
                        const SizedBox(height: 4),
                        Text(
                            'Signal score based on pH, climate, and cost outlook',
                            style: Theme.of(context).textTheme.bodySmall),
                        const SizedBox(height: 14),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(999),
                          child: LinearProgressIndicator(
                            value: readiness / 100,
                            minHeight: 12,
                            backgroundColor: isDark
                                ? const Color(0x14FFFFFF)
                                : const Color(0x14324338),
                            valueColor: AlwaysStoppedAnimation<Color>(primary),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(children: [
                          Expanded(
                              child: FcaMetricTile(
                                  label: 'Readiness', value: '$readiness%')),
                          const SizedBox(width: 8),
                          Expanded(
                              child: FcaMetricTile(
                                  label: 'Signal', value: signal)),
                        ]),
                        const SizedBox(height: 10),
                        Text(result.summary.profitSignal,
                            style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Right column
            Expanded(
              child: Column(
                children: [
                  // Financial projection
                  FcaPanelCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const FcaSectionHead(label: 'Financial projection'),
                        const SizedBox(height: 4),
                        Text('Cost and return profile',
                            style: Theme.of(context).textTheme.bodySmall),
                        const SizedBox(height: 14),
                        Row(children: [
                          Expanded(
                              child: FcaMetricTile(
                                  label: 'Total cost',
                                  value: fcaMoney(result.price.totalCost))),
                          const SizedBox(width: 8),
                          Expanded(
                              child: FcaMetricTile(
                                  label: 'Revenue',
                                  value:
                                      fcaMoney(result.price.expectedRevenue))),
                        ]),
                        const SizedBox(height: 8),
                        Row(children: [
                          Expanded(
                              child: FcaMetricTile(
                                  label: 'Cost/acre',
                                  value: fcaMoney(result.price.costPerAcre))),
                          const SizedBox(width: 8),
                          Expanded(
                              child: FcaMetricTile(
                                  label: 'Margin',
                                  value:
                                      '${(result.price.profitMargin * 100).round()}%')),
                        ]),
                        const SizedBox(height: 10),
                        Text('Source: ${result.price.predictionSource}',
                            style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Operational notes
                  FcaPanelCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const FcaSectionHead(label: 'Operational notes'),
                        const SizedBox(height: 4),
                        Text('Actionable next steps from the run',
                            style: Theme.of(context).textTheme.bodySmall),
                        const SizedBox(height: 14),
                        ...insights.map((n) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: FcaNoteItem(
                                  title: n['title']!, detail: n['detail']!),
                            )),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder
// ─────────────────────────────────────────────────────────────────────────────

class _AdvisoryPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return FcaPanelCard(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Column(
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isDark
                      ? [const Color(0xFF1F5D45), const Color(0xFFBF7040)]
                      : [const Color(0xFF1F5D45), const Color(0xFFBF7040)],
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child:
                  const Icon(Icons.eco_outlined, size: 36, color: Colors.white),
            ),
            const SizedBox(height: 18),
            Text('Advisory Lab',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text(
              'Submit farm inputs to calculate crop fit,\nfertilizer strategy, and cost projection.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Local widgets
// ─────────────────────────────────────────────────────────────────────────────

class _KpiChip extends StatelessWidget {
  const _KpiChip({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isDark ? const Color(0x0CFFFFFF) : const Color(0xB0FFFFFF),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
              color:
                  isDark ? const Color(0x10FFFFFF) : const Color(0x18324338)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.9,
                    color: isDark ? AppTheme.mutedDark : AppTheme.mutedLight)),
            const SizedBox(height: 3),
            Text(value,
                style: Theme.of(context)
                    .textTheme
                    .titleSmall
                    ?.copyWith(fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

class _FormSection extends StatelessWidget {
  const _FormSection(
      {required this.title, required this.subtitle, required this.child});
  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0x08FFFFFF) : const Color(0xA0FFFFFF),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
            color: isDark ? const Color(0x10FFFFFF) : const Color(0xC0FFFFFF)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: TextStyle(
                  fontFamily: 'Georgia',
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: isDark ? AppTheme.forestDark : AppTheme.forestStrong)),
          const SizedBox(height: 2),
          Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _SoilChip extends StatelessWidget {
  const _SoilChip(
      {required this.label,
      required this.sub,
      required this.active,
      required this.onTap});
  final String label;
  final String sub;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primary = isDark ? AppTheme.forestDark : AppTheme.forest;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          gradient: active
              ? LinearGradient(
                  colors: isDark
                      ? [AppTheme.forestDark, const Color(0xFF4AA57A)]
                      : [AppTheme.forest, AppTheme.clay])
              : null,
          color: active
              ? null
              : (isDark ? const Color(0x08FFFFFF) : const Color(0xB0FFFFFF)),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: active
                ? Colors.transparent
                : (isDark ? const Color(0x14FFFFFF) : const Color(0x18324338)),
          ),
          boxShadow: active
              ? [
                  BoxShadow(
                      color: primary.withOpacity(0.25),
                      blurRadius: 16,
                      offset: const Offset(0, 6))
                ]
              : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(label,
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: active
                        ? Colors.white
                        : (isDark ? AppTheme.textDark : AppTheme.textLight))),
            Text(sub,
                style: TextStyle(
                    fontSize: 10,
                    color: active
                        ? const Color(0xCCFFFFFF)
                        : (isDark ? AppTheme.mutedDark : AppTheme.mutedLight))),
          ],
        ),
      ),
    );
  }
}

class _NumField extends StatelessWidget {
  const _NumField({required this.ctrl, required this.label});
  final TextEditingController ctrl;
  final String label;

  @override
  Widget build(BuildContext context) => TextFormField(
        controller: ctrl,
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
        decoration: InputDecoration(labelText: label.toUpperCase()),
        validator: (v) {
          if (v == null || v.isEmpty) return 'Required';
          if (double.tryParse(v) == null) return 'Invalid';
          return null;
        },
      );
}
