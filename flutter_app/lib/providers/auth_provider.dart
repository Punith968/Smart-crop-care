import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/api_models.dart';
import '../services/api_service.dart';

// ── Shared Preferences (synchronous override from main) ──────────────────────
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('Override sharedPreferencesProvider in main()');
});

// ── Theme ─────────────────────────────────────────────────────────────────────
final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>(
  (ref) {
    final prefs = ref.watch(sharedPreferencesProvider);
    return ThemeModeNotifier(prefs);
  },
);

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier(this._prefs)
      : super(_prefs.getString('theme') == 'dark'
            ? ThemeMode.dark
            : ThemeMode.light);
  final SharedPreferences _prefs;

  void toggle() {
    final next = state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    state = next;
    _prefs.setString('theme', next == ThemeMode.dark ? 'dark' : 'light');
  }
}

// ── API Service ───────────────────────────────────────────────────────────────
final apiServiceProvider = Provider<ApiService>((ref) {
  const configuredBaseUrl = String.fromEnvironment('API_BASE_URL');

  late String baseUrl;

  if (configuredBaseUrl.isNotEmpty) {
    baseUrl = configuredBaseUrl;
    debugPrint('[API] Using configured base URL: $baseUrl');
  } else if (kIsWeb) {
    baseUrl = 'http://127.0.0.1:8000'; // Web browser (pointing to local backend)
    debugPrint('[API] Using Web URL: $baseUrl');
  } else if (defaultTargetPlatform == TargetPlatform.android) {
    baseUrl = 'http://10.0.2.2:8000'; // Android emulator
    debugPrint('[API] Using Android emulator URL: $baseUrl');
  } else if (defaultTargetPlatform == TargetPlatform.windows ||
             defaultTargetPlatform == TargetPlatform.linux) {
    baseUrl = 'http://127.0.0.1:8000'; // Windows/Linux desktop
    debugPrint('[API] Using Windows/Linux desktop URL: $baseUrl');
  } else {
    baseUrl = 'http://127.0.0.1:8000'; // iOS simulator or macOS
    debugPrint('[API] Using localhost URL: $baseUrl (for iOS simulator/macOS)');
  }

  return ApiService(baseUrl: baseUrl);
});

// ── Auth State ────────────────────────────────────────────────────────────────
class AuthState {
  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = true,
    this.user,
    this.error,
  });
  final bool isAuthenticated;
  final bool isLoading;
  final UserProfile? user;
  final String? error;

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    UserProfile? user,
    String? error,
    bool clearError = false,
  }) =>
      AuthState(
        isAuthenticated: isAuthenticated ?? this.isAuthenticated,
        isLoading: isLoading ?? this.isLoading,
        user: user ?? this.user,
        error: clearError ? null : (error ?? this.error),
      );
}

class AuthNotifier extends StateNotifier<AuthState> {
  static int _instanceCount = 0;
  late final int _instanceId;

  AuthNotifier(this._api, this._prefs) : super(const AuthState()) {
    _instanceId = ++_instanceCount;
    debugPrint(
        '[Auth] AuthNotifier #$_instanceId created with initial state isLoading=true');
    _bootstrap();
  }
  final ApiService _api;
  final SharedPreferences _prefs;
  bool _alreadyVerified = false;

  @override
  set state(AuthState value) {
    if (value.isLoading != state.isLoading) {
      debugPrint(
          '[Auth #$_instanceId] ⚠️ isLoading changed: ${state.isLoading} → ${value.isLoading}');
      debugPrintStack(label: '[Auth #$_instanceId] State change stack trace');
    }
    debugPrint(
        '[Auth #$_instanceId] state updated: isLoading=${value.isLoading}, isAuthenticated=${value.isAuthenticated}, hasUser=${value.user != null}');
    super.state = value;
  }

  Future<void> _bootstrap() async {
    debugPrint('[Auth #$_instanceId] _bootstrap: starting');
    final token = _prefs.getString('fca_token');
    debugPrint('[Auth #$_instanceId] _bootstrap: token in storage: ${token != null}');

    if (token == null) {
      debugPrint('[Auth #$_instanceId] _bootstrap: no token found, setting isLoading=false');
      state = const AuthState(isLoading: false, isAuthenticated: false);
      return;
    }

    debugPrint('[Auth #$_instanceId] _bootstrap: token found, setting in API service');
    _api.setToken(token);
    state = state.copyWith(isLoading: false, isAuthenticated: true);

    if (_alreadyVerified) {
      debugPrint('[Auth #$_instanceId] _bootstrap: already verified, skipping user verification');
      return;
    }

    _alreadyVerified = true;
    debugPrint('[Auth #$_instanceId] _bootstrap: attempting to verify user with getMe()');

    try {
      final user = await _api.getMe();
      debugPrint('[Auth #$_instanceId] _bootstrap: getMe() succeeded, user=${user.username}');
      state = AuthState(
        isLoading: false,
        isAuthenticated: true,
        user: user,
        error: null,
      );
    } catch (e) {
      debugPrint('[Auth #$_instanceId] _bootstrap: getMe() failed: $e, clearing token');
      await _prefs.remove('fca_token');
      _api.clearToken();
      state = const AuthState(isLoading: false, isAuthenticated: false);
    }
  }

  Future<void> login(String username, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final resp = await _api.login(username, password);
      await _prefs.setString('fca_token', resp.accessToken);
      _api.setToken(resp.accessToken);
      _alreadyVerified = true;
      state =
          AuthState(isAuthenticated: true, isLoading: false, user: resp.user);
    } catch (e) {
      state = state.copyWith(
          isLoading: false, error: e.toString(), isAuthenticated: false);
      rethrow;
    }
  }

  Future<void> register(
      String username, String password, String? fullName) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final resp = await _api.register(username, password, fullName);
      await _prefs.setString('fca_token', resp.accessToken);
      _api.setToken(resp.accessToken);
      _alreadyVerified = true;
      state =
          AuthState(isAuthenticated: true, isLoading: false, user: resp.user);
    } catch (e) {
      state = state.copyWith(
          isLoading: false, error: e.toString(), isAuthenticated: false);
      rethrow;
    }
  }

  Future<void> logout() async {
    await _api.logout();
    await _prefs.remove('fca_token');
    state = const AuthState(isLoading: false);
  }

  void clearError() => state = state.copyWith(clearError: true);
}

final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final api = ref.watch(apiServiceProvider);
  final prefs = ref.watch(sharedPreferencesProvider);
  return AuthNotifier(api, prefs);
});
