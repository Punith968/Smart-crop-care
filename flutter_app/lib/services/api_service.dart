import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/api_models.dart';

class ApiException implements Exception {

  ApiException({required this.message, this.statusCode});
  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiService {

  ApiService({required this.baseUrl});
  final String baseUrl;
  String? _token;

  void setToken(String token) => _token = token;
  void clearToken() => _token = null;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Future<Map<String, dynamic>> _post(
      String path, Map<String, dynamic> body) async {
    final uri = Uri.parse('$baseUrl$path');
    try {
      debugPrint('[API] POST $path to $baseUrl');
      final response = await http
          .post(uri, headers: _headers, body: jsonEncode(body))
          .timeout(const Duration(seconds: 15));
      debugPrint('[API] Response: ${response.statusCode}');
      return _handle(response);
    } on TimeoutException {
      debugPrint('[API] Timeout after 15s on POST $path');
      throw ApiException(
        message: 'Connection timeout (15s). Ensure backend is running at $baseUrl',
      );
    } catch (e) {
      debugPrint('[API] Error on POST $path: $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> _get(String path) async {
    final uri = Uri.parse('$baseUrl$path');
    try {
      debugPrint('[API] GET $path from $baseUrl');
      final response = await http
          .get(uri, headers: _headers)
          .timeout(const Duration(seconds: 15));
      debugPrint('[API] Response: ${response.statusCode}');
      return _handle(response);
    } on TimeoutException {
      debugPrint('[API] Timeout after 15s on GET $path');
      throw ApiException(
        message: 'Connection timeout (15s). Ensure backend is running at $baseUrl',
      );
    } catch (e) {
      debugPrint('[API] Error on GET $path: $e');
      rethrow;
    }
  }

  Map<String, dynamic> _handle(http.Response response) {
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }
    final detail = body['detail'];
    final message = detail is String
        ? detail
        : detail is List
            ? (detail.first as Map)['msg'] ?? 'Request failed'
            : 'Request failed (${response.statusCode})';
    throw ApiException(message: message, statusCode: response.statusCode);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  Future<AuthResponse> login(String username, String password) async {
    debugPrint('[API:Login] Attempting login for username=$username');
    try {
      final data = await _post('/auth/login', {
        'username': username,
        'password': password,
      });
      final resp = AuthResponse.fromJson(data);
      debugPrint('[API:Login] Login successful, token length=${resp.accessToken.length}, user=${resp.user.username}');
      setToken(resp.accessToken);
      return resp;
    } catch (e) {
      debugPrint('[API:Login] Login failed: $e');
      rethrow;
    }
  }

  Future<AuthResponse> register(
      String username, String password, String? fullName) async {
    debugPrint('[API:Register] Attempting registration for username=$username, fullName=$fullName');
    try {
      final data = await _post('/auth/register', {
        'username': username,
        'password': password,
        if (fullName != null && fullName.isNotEmpty) 'full_name': fullName,
      });
      final resp = AuthResponse.fromJson(data);
      debugPrint('[API:Register] Registration successful, token length=${resp.accessToken.length}, user=${resp.user.username}');
      setToken(resp.accessToken);
      return resp;
    } catch (e) {
      debugPrint('[API:Register] Registration failed: $e');
      rethrow;
    }
  }

  Future<UserProfile> getMe() async {
    debugPrint('[API:GetMe] Fetching current user, token present=${_token != null}, token length=${_token?.length ?? 0}');
    try {
      final data = await _get('/auth/me');
      final user = UserProfile.fromJson(data);
      debugPrint('[API:GetMe] Success: user=${user.username}');
      return user;
    } catch (e) {
      debugPrint('[API:GetMe] Failed: $e');
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      await _post('/auth/logout', {});
    } catch (_) {
      // best-effort
    } finally {
      clearToken();
    }
  }

  // ── Workspace ─────────────────────────────────────────────────────────────

  Future<AdvisoryWorkspaceResult> runAdvisory(
      AdvisoryWorkspaceRequest req) async {
    final data = await _post('/workspace/advisory', req.toJson());
    return AdvisoryWorkspaceResult.fromJson(data);
  }

  Future<DiseaseWorkspaceResult> runDisease(DiseaseWorkspaceRequest req) async {
    final data = await _post('/workspace/disease', req.toJson());
    return DiseaseWorkspaceResult.fromJson(data);
  }

  // ── Reports ───────────────────────────────────────────────────────────────

  Future<ReportEntry> saveReport(ReportCreateRequest req) async {
    final data = await _post('/reports/save', req.toJson());
    return ReportEntry.fromJson(data);
  }

  Future<ReportSummary> listReports() async {
    final data = await _get('/reports');
    return ReportSummary.fromJson(data);
  }

  String reportDownloadUrl(String reportId) =>
      '$baseUrl/reports/$reportId/download';

  // ── Health ────────────────────────────────────────────────────────────────

  Future<bool> healthCheck() async {
    try {
      final uri = Uri.parse('$baseUrl/health');
      final response = await http.get(uri).timeout(const Duration(seconds: 5));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
