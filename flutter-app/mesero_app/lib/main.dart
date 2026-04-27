import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/login_screen.dart';
import 'screens/mesas_screen.dart';
import 'screens/nuevo_pedido_screen.dart';
import 'screens/pedidos_screen.dart';
import 'screens/recibo_pedido_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');
  runApp(MyApp(initialRoute: token != null ? '/mesas' : '/'));
}

class MyApp extends StatelessWidget {
  final String initialRoute;
  const MyApp({super.key, required this.initialRoute});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PepiBurguer Mesero',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFFF6B00)),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      initialRoute: initialRoute,
      routes: {
        '/': (context) => const LoginScreen(),
        '/mesas': (context) => const MesasScreen(),
        '/nuevo_pedido': (context) => const NuevoPedidoScreen(),
        '/pedidos': (context) => const PedidosScreen(),
        '/recibo_pedido': (context) {
          final args = ModalRoute.of(context)!.settings.arguments as Map;
          return ReciboPedidoScreen(
            pedido: args['pedido'],
            productos: List<Map<String, dynamic>>.from(args['productos']),
            tipoPedido: args['tipoPedido'],
            nombreMesa: args['nombreMesa'],
            nombreCliente: args['nombreCliente'],
            direccionCliente: args['direccionCliente'],
            barrioCliente: args['barrioCliente'],
            celularCliente: args['celularCliente'],
          );
        },
      },
    );
  }
}
