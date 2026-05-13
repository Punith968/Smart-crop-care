import 'package:flutter/material.dart';
import '../config/theme/app_theme.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Shared widgets — mirrors the web UI design system
// ─────────────────────────────────────────────────────────────────────────────

/// Glassmorphic panel card — matches .auth-card / .control-panel / .premium-card
class FcaPanelCard extends StatelessWidget {

  const FcaPanelCard({
    required this.child, super.key,
    this.padding,
    this.overrideColor,
  });
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final Color? overrideColor;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: padding ?? const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: overrideColor ??
            (isDark ? const Color(0xFF1C1C1E) : const Color(0xFFFFFCF6)),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: isDark ? const Color(0x14FFFFFF) : const Color(0xD0FFFFFF),
          width: isDark ? 1 : 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? const Color(0x44000000)
                : const Color(0x14253020),
            blurRadius: 32,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: child,
    );
  }
}

/// Dark hero result card — matches .hero-result-card (forest gradient)
class FcaHeroCard extends StatelessWidget {
  const FcaHeroCard({required this.child, super.key});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: isDark
            ? const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF19191B), Color(0xFF232326), Color(0xFF303033)],
              )
            : const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF184231), Color(0xFF286D51), Color(0xFFB86D41)],
              ),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: isDark ? const Color(0x14FFFFFF) : const Color(0x30FFFFFF),
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? const Color(0x55000000)
                : const Color(0x302E3D33),
            blurRadius: 40,
            offset: const Offset(0, 18),
          ),
        ],
      ),
      child: child,
    );
  }
}

/// Disease hero card — matches .diagnosis-hero-card (berry/clay gradient)
class FcaDiseaseHeroCard extends StatelessWidget {
  const FcaDiseaseHeroCard({required this.child, super.key});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: isDark
            ? const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF151517), Color(0xFF1F1F22)],
              )
            : const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF7A2B35), Color(0xFF71352A), Color(0xFFB86D41)],
              ),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: isDark ? const Color(0x14FFFFFF) : const Color(0x30FFFFFF),
        ),
        boxShadow: [
          BoxShadow(
            color: isDark
                ? const Color(0x55000000)
                : const Color(0x307E2F3E),
            blurRadius: 40,
            offset: const Offset(0, 18),
          ),
        ],
      ),
      child: child,
    );
  }
}

/// Eyebrow + title + optional subtitle — matches .panel-header
class FcaPanelHeader extends StatelessWidget { // white text for dark hero cards

  const FcaPanelHeader({
    required this.eyebrow, required this.title, super.key,
    this.subtitle,
    this.light = false,
  });
  final String eyebrow;
  final String title;
  final String? subtitle;
  final bool light;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accentColor = light
        ? const Color(0xBBFFFFFF)
        : (isDark ? AppTheme.forestDark : AppTheme.forest);
    final titleColor = light ? Colors.white : null;
    final subColor = light ? const Color(0xAAFFFFFF) : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          eyebrow,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: accentColor,
                letterSpacing: 1.8,
              ),
        ),
        const SizedBox(height: 6),
        Text(
          title,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: titleColor,
                height: 1.1,
              ),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 6),
          Text(
            subtitle!,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: subColor,
                ),
          ),
        ],
      ],
    );
  }
}

/// Section label — matches .section-head p
class FcaSectionHead extends StatelessWidget {
  const FcaSectionHead({required this.label, super.key, this.light = false});
  final String label;
  final bool light;

  @override
  Widget build(BuildContext context) => Text(
      label,
      style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontFamily: 'Georgia',
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: light
                ? const Color(0xBBFFFFFF)
                : (Theme.of(context).brightness == Brightness.dark
                    ? AppTheme.forestDark
                    : AppTheme.forestStrong),
          ),
    );
}

/// Metric tile — matches .panel-kpi-row article / .metric-band article
class FcaMetricTile extends StatelessWidget {

  const FcaMetricTile({
    required this.label, required this.value, super.key,
    this.light = false,
  });
  final String label;
  final String value;
  final bool light;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = light
        ? const Color(0x18FFFFFF)
        : (isDark ? const Color(0x0CFFFFFF) : const Color(0xB0FFFFFF));
    final border = light
        ? const Color(0x18FFFFFF)
        : (isDark ? const Color(0x10FFFFFF) : const Color(0x18324338));
    final labelColor = light
        ? const Color(0xAAFFFFFF)
        : (isDark ? AppTheme.mutedDark : AppTheme.mutedLight);
    final valueColor = light ? Colors.white : null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.9,
              color: labelColor,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: valueColor,
                  fontSize: 15,
                ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

/// Status banner — matches .status-banner
class FcaStatusBanner extends StatelessWidget {

  const FcaStatusBanner({
    required this.message, super.key,
    this.isError = false,
  });
  final String message;
  final bool isError;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final color = isError
        ? Theme.of(context).colorScheme.error
        : (isDark ? AppTheme.forestDark : AppTheme.forest);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withValues(alpha: 0.14)),
      ),
      child: Text(
        message,
        style: TextStyle(
          fontSize: 13,
          color: color,
          fontWeight: FontWeight.w600,
          height: 1.5,
        ),
      ),
    );
  }
}

/// Note/plan item — matches .note-item / .plan-item
class FcaNoteItem extends StatelessWidget {

  const FcaNoteItem({
    required this.title, required this.detail, super.key,
    this.pending = false,
  });
  final String title;
  final String detail;
  final bool pending;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = pending
        ? (isDark
            ? const Color(0x38C8A07D)
            : const Color(0x20DFB872))
        : (isDark ? const Color(0xFF26272B) : const Color(0xF0FFFFFF));
    final border = pending
        ? (isDark ? const Color(0x40C8A07D) : const Color(0x40B86D41))
        : (isDark ? const Color(0x18FFFFFF) : const Color(0x18324338));

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: pending
                      ? (isDark
                          ? const Color(0xFFF0CEB1)
                          : AppTheme.clayDeep)
                      : null,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            detail,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

String fcaTitleCase(String s) {
  if (s.isEmpty) return s;
  return s[0].toUpperCase() + s.substring(1).toLowerCase();
}

String fcaMoney(double v) => 'Rs. ${v.toStringAsFixed(2)}';

String fcaPhTone(double ph) {
  if (ph < 5.5) return 'Strongly acidic';
  if (ph < 6.2) return 'Mildly acidic';
  if (ph <= 7.2) return 'Balanced zone';
  if (ph <= 8.0) return 'Mildly alkaline';
  return 'Strongly alkaline';
}
