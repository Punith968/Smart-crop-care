import 'dart:convert';
import 'package:http/http.dart' as http;

class AdvisoryApiService {
  AdvisoryApiService({required this.baseUrl});

  final String baseUrl;

  Future<String> recommendCrop(Map<String, dynamic> payload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/predict/crop'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );
    if (res.statusCode != 200) {
      throw Exception('Crop API failed: ${res.body}');
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return data['recommended_crop'] as String;
  }

  Future<String> recommendFertilizer(Map<String, dynamic> payload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/predict/fertilizer'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );
    if (res.statusCode != 200) {
      throw Exception('Fertilizer API failed: ${res.body}');
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    return data['recommended_fertilizer'] as String;
  }

  Future<Map<String, dynamic>> estimatePrice(
    Map<String, dynamic> payload,
  ) async {
    final res = await http.post(
      Uri.parse('$baseUrl/estimate/price'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );
    if (res.statusCode != 200) {
      throw Exception('Price API failed: ${res.body}');
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> detectDisease(
    Map<String, dynamic> payload,
  ) async {
    final res = await http.post(
      Uri.parse('$baseUrl/detect/disease'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );
    if (res.statusCode != 200) {
      throw Exception('Disease API failed: ${res.body}');
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }
}
