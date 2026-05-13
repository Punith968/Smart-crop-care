import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/auth_provider.dart';
import '../../screens/auth/auth_screen.dart';
import '../../screens/home/crop_advisory_screen.dart';
import '../../screens/home/dashboard_screen.dart';
import '../../screens/home/disease_detection_screen.dart';
import '../../screens/home/fertilizer_advisory_screen.dart';
import '../../screens/home/price_estimation_screen.dart';
import '../../screens/home/profile_screen.dart';
import '../../screens/home/reports_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  // Watch auth state to trigger router refresh
  final authState = ref.watch(authNotifierProvider);

  debugPrint('[AppRouter] Building router with auth state: isAuth=${authState.isAuthenticated}, isLoading=${authState.isLoading}, user=${authState.user?.username}');

  return GoRouter(
    initialLocation: '/',
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(title: const Text('Error')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            const Text('Page not found'),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => GoRouter.of(context).go('/'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
    redirect: (context, state) {
      final location = state.location;

      debugPrint('[Router:Redirect] location=$location, isAuth=${authState.isAuthenticated}, isLoading=${authState.isLoading}');

      // While loading, show splash
      if (authState.isLoading) {
        if (location != '/splash') {
          debugPrint('[Router:Redirect] Loading detected → redirecting to /splash');
          return '/splash';
        }
        return null;
      }

      // Not authenticated
      if (!authState.isAuthenticated) {
        // If already on auth pages, don't redirect
        if (location == '/login' || location == '/register') {
          debugPrint('[Router:Redirect] Not auth but on auth page, staying');
          return null;
        }
        // Redirect to login
        debugPrint('[Router:Redirect] Not authenticated → redirecting from $location to /login');
        return '/login';
      }

      // Authenticated
      if (location == '/login' || location == '/register' || location == '/splash') {
        debugPrint('[Router:Redirect] Authenticated, leaving auth page → redirecting to /');
        return '/';
      }

      debugPrint('[Router:Redirect] No redirect needed for $location');
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) {
          debugPrint('[GoRoute] Building /login screen');
          return const AuthScreen(initialTabIndex: 0);
        },
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) {
          debugPrint('[GoRoute] Building /register screen');
          return const AuthScreen(initialTabIndex: 1);
        },
      ),
      GoRoute(
        path: '/',
        builder: (context, state) {
          debugPrint('[GoRoute] Building / (dashboard) screen, isAuth=${authState.isAuthenticated}');
          return const DashboardScreen();
        },
        routes: [
          GoRoute(
            path: 'crop-advisory',
            builder: (context, state) => const CropAdvisoryScreen(),
          ),
          GoRoute(
            path: 'fertilizer-advisory',
            builder: (context, state) => const FertilizerAdvisoryScreen(),
          ),
          GoRoute(
            path: 'price-estimation',
            builder: (context, state) => const PriceEstimationScreen(),
          ),
          GoRoute(
            path: 'disease-detection',
            builder: (context, state) => const DiseaseDetectionScreen(),
          ),
          GoRoute(
            path: 'reports',
            builder: (context, state) => const ReportsScreen(),
          ),
          GoRoute(
            path: 'profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
  );
});
