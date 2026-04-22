import 'package:flutter/material.dart';
import '../api/api_service.dart';

class PedidosScreen extends StatefulWidget {
  const PedidosScreen({super.key});

  @override
  State<PedidosScreen> createState() => _PedidosScreenState();
}

class _PedidosScreenState extends State<PedidosScreen> {
  List<dynamic> pedidos = [];
  List<dynamic> productos = [];
  List<dynamic> mesas = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    cargarDatos();
  }

  Future<void> cargarDatos() async {
    final p = await getPedidos();
    final prods = await getProductos();
    final ms = await getMesas();
    setState(() {
      pedidos = p.where((p) => p['estado_pedido'] == 'no_cancelado').toList();
      productos = prods;
      mesas = ms;
      loading = false;
    });
  }

  String getNombreMesa(int? idMesa) {
    if (idMesa == null) return 'Mesa';
    final mesa = mesas.where((m) => m['id_mesa'] == idMesa).toList();
    return mesa.isNotEmpty ? 'Mesa ${mesa.first['numero_mesa']}' : 'Mesa $idMesa';
  }

  String formatPesos(double valor) {
    return '\$${valor.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F3F5),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1F2E),
        title: const Text(
          'Mis Pedidos',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFFF6B00)))
          : RefreshIndicator(
              onRefresh: cargarDatos,
              color: const Color(0xFFFF6B00),
              child: pedidos.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('📋', style: TextStyle(fontSize: 48)),
                          SizedBox(height: 16),
                          Text(
                            'No hay pedidos activos',
                            style: TextStyle(color: Colors.grey, fontSize: 16),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: pedidos.length,
                      itemBuilder: (context, index) {
                        final pedido = pedidos[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.05),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          width: 48,
                                          height: 48,
                                          decoration: BoxDecoration(
                                            gradient: const LinearGradient(
                                              colors: [Color(0xFFFF6B00), Color(0xFFCC2200)],
                                            ),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Center(
                                            child: Text(
                                              '#${pedido['id_pedido'].toString().padLeft(3, '0')}',
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              pedido['tipo_pedido'] == 'mesa'
                                                  ? getNombreMesa(pedido['id_mesa'])
                                                  : pedido['tipo_pedido'] == 'domicilio'
                                                      ? 'Domicilio'
                                                      : 'Para Llevar',
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 16,
                                              ),
                                            ),
                                            Text(
                                              pedido['tipo_pedido'],
                                              style: const TextStyle(
                                                color: Colors.grey,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    Text(
                                      formatPesos(double.parse(pedido['valor_total'].toString())),
                                      style: const TextStyle(
                                        color: Color(0xFFCC2200),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ],
                                ),
                                const Divider(height: 20),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFF3E0),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.pending, color: Color(0xFFFF6B00), size: 16),
                                      const SizedBox(width: 6),
                                      Text(
                                        'En preparación',
                                        style: TextStyle(
                                          color: Colors.orange[800],
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF1A1F2E),
        selectedItemColor: const Color(0xFFFF6B00),
        unselectedItemColor: Colors.grey,
        currentIndex: 1,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.table_restaurant),
            label: 'Mesas',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long),
            label: 'Pedidos',
          ),
        ],
        onTap: (index) {
          if (index == 0) {
            Navigator.pushReplacementNamed(context, '/mesas');
          }
        },
      ),
    );
  }
}