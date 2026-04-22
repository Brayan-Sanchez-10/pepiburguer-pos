import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

const String baseUrl = 'http://10.0.2.2:8000';

Future<String?> getToken() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString('token');
}

Future<Map<String, String>> getHeaders() async {
  final token = await getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  };
}

// AUTH
Future<Map<String, dynamic>?> login(String cedula, String password) async {
  final response = await http.post(
    Uri.parse('$baseUrl/auth/login'),
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: {'username': cedula, 'password': password},
  );
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  }
  return null;
}

// MESAS
Future<List<dynamic>> getMesas() async {
  final headers = await getHeaders();
  final response = await http.get(
    Uri.parse('$baseUrl/mesas/'),
    headers: headers,
  );
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  }
  return [];
}

// CATEGORIAS
Future<List<dynamic>> getCategorias() async {
  final headers = await getHeaders();
  final response = await http.get(
    Uri.parse('$baseUrl/categorias/'),
    headers: headers,
  );
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  }
  return [];
}

// PRODUCTOS
Future<List<dynamic>> getProductos() async {
  final headers = await getHeaders();
  final response = await http.get(
    Uri.parse('$baseUrl/productos/'),
    headers: headers,
  );
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  }
  return [];
}

// TURNOS
Future<List<dynamic>> getTurnos() async {
  final headers = await getHeaders();
  final response = await http.get(
    Uri.parse('$baseUrl/turnos/'),
    headers: headers,
  );
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  }
  return [];
}

// PEDIDOS
Future<List<dynamic>> getPedidos() async {
  final headers = await getHeaders();
  final response = await http.get(
    Uri.parse('$baseUrl/pedidos/'),
    headers: headers,
  );
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  }
  return [];
}

Future<Map<String, dynamic>?> crearPedido(Map<String, dynamic> data) async {
  final headers = await getHeaders();
  final response = await http.post(
    Uri.parse('$baseUrl/pedidos/'),
    headers: headers,
    body: jsonEncode(data),
  );
  if (response.statusCode == 201) {
    return jsonDecode(response.body);
  }
  return null;
}

Future<bool> agregarProductoPedido(Map<String, dynamic> data) async {
  final headers = await getHeaders();
  final response = await http.post(
    Uri.parse('$baseUrl/pedidos_productos/'),
    headers: headers,
    body: jsonEncode(data),
  );
  return response.statusCode == 201;
}

Future<bool> crearDomicilio(Map<String, dynamic> data) async {
  final headers = await getHeaders();
  final response = await http.post(
    Uri.parse('$baseUrl/domicilios/'),
    headers: headers,
    body: jsonEncode(data),
  );
  return response.statusCode == 201;
}