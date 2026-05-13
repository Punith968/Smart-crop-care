import 'package:flutter/material.dart';

class AppTheme {
  // ── Light palette (earth-tone, matches web UI) ──────────────────────────
  static const Color bgLight = Color(0xFFF8F1E8);
  static const Color panelLight = Color(0xFFFFFCF6);
  static const Color forest = Color(0xFF1F5D45);
  static const Color forestStrong = Color(0xFF113728);
  static const Color forestSoft = Color(0xFF4F8F72);
  static const Color clay = Color(0xFFBF7040);
  static const Color clayDeep = Color(0xFF8F4F28);
  static const Color wheat = Color(0xFFE5C070);
  static const Color berry = Color(0xFF7F2F42);
  static const Color mutedLight = Color(0xFF5F7064);
  static const Color textLight = Color(0xFF172217);
  static const Color lineLight = Color(0x1C324338);
  static const Color danger = Color(0xFF8D2830);
  static const Color success = Color(0xFF1F6A47);

  // ── Dark palette ─────────────────────────────────────────────────────────
  static const Color bgDark = Color(0xFF0B0B0C);
  static const Color panelDark = Color(0xFF1C1C1E);
  static const Color forestDark = Color(0xFF87D8B0);
  static const Color forestStrongDark = Color(0xFFDEFFF1);
  static const Color clayDark = Color(0xFFC8A07D);
  static const Color mutedDark = Color(0xFFA7ABB1);
  static const Color textDark = Color(0xFFF5F3EF);

  static ThemeData get lightTheme => _build(Brightness.light);
  static ThemeData get darkTheme => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final bg = isDark ? bgDark : bgLight;
    final surface = isDark ? panelDark : panelLight;
    final primary = isDark ? forestDark : forest;
    final onPrimary = isDark ? const Color(0xFF08110D) : Colors.white;
    final textColor = isDark ? textDark : textLight;
    final muted = isDark ? mutedDark : mutedLight;

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: bg,
      colorScheme: ColorScheme(
        brightness: brightness,
        primary: primary,
        onPrimary: onPrimary,
        secondary: clay,
        onSecondary: Colors.white,
        error: danger,
        onError: Colors.white,
        surface: surface,
        onSurface: textColor,
      ),
      textTheme: TextTheme(
        displayLarge: TextStyle(
          fontFamily: 'Georgia',
          fontSize: 48,
          fontWeight: FontWeight.w700,
          color: textColor,
          letterSpacing: -2,
          height: 0.96,
        ),
        displayMedium: TextStyle(
          fontFamily: 'Georgia',
          fontSize: 36,
          fontWeight: FontWeight.w700,
          color: textColor,
          letterSpacing: -1.5,
          height: 1,
        ),
        displaySmall: TextStyle(
          fontFamily: 'Georgia',
          fontSize: 28,
          fontWeight: FontWeight.w700,
          color: textColor,
          letterSpacing: -1,
          height: 1.05,
        ),
        headlineMedium: TextStyle(
          fontFamily: 'Georgia',
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: textColor,
          letterSpacing: -0.5,
        ),
        headlineSmall: TextStyle(
          fontFamily: 'Georgia',
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: textColor,
        ),
        titleLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w800,
          color: textColor,
        ),
        titleMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: textColor,
        ),
        titleSmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: muted,
          letterSpacing: 0.8,
        ),
        bodyLarge: TextStyle(fontSize: 16, color: textColor, height: 1.65),
        bodyMedium: TextStyle(fontSize: 14, color: textColor, height: 1.6),
        bodySmall: TextStyle(fontSize: 12, color: muted, height: 1.55),
        labelLarge: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w800,
          color: textColor,
          letterSpacing: 0.5,
        ),
        labelSmall: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          color: muted,
          letterSpacing: 1.2,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? const Color(0x12FFFFFF) : const Color(0xB3FFFCF6),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(
            color: isDark ? const Color(0x14FFFFFF) : const Color(0x1C324338),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(
            color: isDark ? const Color(0x14FFFFFF) : const Color(0x1C324338),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(
            color: isDark ? forestDark : forest,
            width: 2,
          ),
        ),
        labelStyle: TextStyle(
            color: muted,
            fontSize: 12,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.8),
        hintStyle: TextStyle(color: muted.withAlpha((0.6 * 255).toInt())),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: isDark ? forestDark : forest,
          foregroundColor: onPrimary,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
          elevation: 0,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: textColor,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
          side: BorderSide(
            color: isDark ? const Color(0x14FFFFFF) : const Color(0x1C324338),
          ),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        color: surface,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: bg,
        foregroundColor: textColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleTextStyle: TextStyle(
          fontFamily: 'Georgia',
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: textColor,
        ),
      ),
    );
  }
}
