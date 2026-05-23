import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = String.fromEnvironment(
    'API_URL', 
    defaultValue: 'http://localhost:8000'
  );

  final String? authToken;

  ApiService({this.authToken});

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (authToken != null) 'Authorization': 'Bearer $authToken',
  };

  Future<String?> registerUser(Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: _headers,
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      return body['user_id'];
    }
    return null;
  }

  Future<bool> saveProfile(String userId, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/onboarding/profile'),
      headers: _headers,
      body: jsonEncode({'user_id': userId, ...data}),
    );
    return response.statusCode == 200;
  }

  Future<bool> saveSchedule(String userId, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/onboarding/schedule'),
      headers: _headers,
      body: jsonEncode({'user_id': userId, ...data}),
    );
    return response.statusCode == 200;
  }

  Future<bool> saveKitchen(String userId, Map<String, dynamic> data) async {
    final response = await http.post(
      Uri.parse('$baseUrl/onboarding/kitchen'),
      headers: _headers,
      body: jsonEncode({'user_id': userId, ...data}),
    );
    return response.statusCode == 200;
  }

  Future<Map<String, dynamic>?> getTodayPlan(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/plan/today?user_id=$userId'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return null;
  }

  Future<Map<String, dynamic>?> regeneratePlan(String userId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/plan/regenerate'),
      headers: _headers,
      body: jsonEncode({'user_id': userId}),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return null;
  }

  Future<bool> updateKitchen(String userId, Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse('$baseUrl/kitchen/update'),
      headers: _headers,
      body: jsonEncode({'user_id': userId, ...data}),
    );
    return response.statusCode == 200;
  }

  Future<bool> logWeight(String userId, double weight) async {
    final response = await http.post(
      Uri.parse('$baseUrl/log/weight'),
      headers: _headers,
      body: jsonEncode({'user_id': userId, 'weight_kg': weight}),
    );
    return response.statusCode == 200;
  }

  Future<bool> logMeal(String userId, Map<String, dynamic> meal) async {
    final response = await http.post(
      Uri.parse('$baseUrl/log/meal'),
      headers: _headers,
      body: jsonEncode({'user_id': userId, 'meal': meal}),
    );
    return response.statusCode == 200;
  }

  Future<bool> logWorkout(String userId, bool done) async {
    final response = await http.post(
      Uri.parse('$baseUrl/log/workout'),
      headers: _headers,
      body: jsonEncode({'user_id': userId, 'done': done}),
    );
    return response.statusCode == 200;
  }

  Future<List<dynamic>> getHistory(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/log/history?user_id=$userId'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return [];
  }
}
