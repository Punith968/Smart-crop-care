import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'config/router/app_router.dart';
import 'config/theme/app_theme.dart';
import 'providers/auth_provider.dart';
// auth and dashboard screens are routed via GoRouter; no direct import needed

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  runApp(
    ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
      child: const FarmerCropAdvisoryApp(),
    ),
  );
}

class FarmerCropAdvisoryApp extends ConsumerWidget {
  const FarmerCropAdvisoryApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final router = ref.watch(appRouterProvider);
    return MaterialApp.router(
      title: 'Farmer Crop Advisory',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: router,
    );
  }
}
// AppShell is no longer used; routing is handled by GoRouter
