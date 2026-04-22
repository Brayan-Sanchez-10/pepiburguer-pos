import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_service.dart';

class MesasScreen extends StatefulWidget {
  const MesasScreen({super.key});

  @override
  State<MesasScreen> createState() => _MesasScreenState();
}

class _MesasScreenState extends State<MesasScreen> {
  List<dynamic> mesas = [];
  bool loading = true;
  String nombre = '';

  @override
  void initState() {
    super.initState();
    cargarDatos();
  }

  Future<void> cargarDatos() async {
    final prefs = await SharedPreferences.getInstance();
    final data = await getMesas();
    setState(() {
      mesas = data;
      nombre = prefs.getString('nombre') ?? '';
      loading = false;
    });
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (mounted) {
      Navigator.pushReplacementNamed(context, '/');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F3F5),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1F2E),
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFF6B00), Color(0xFFCC2200)],
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Center(
                child: Text('🍔', style: TextStyle(fontSize: 18)),
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'PepiBurguer',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: Row(
              children: [
                Text(
                  nombre,
                  style: const TextStyle(color: Colors.grey, fontSize: 13),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.logout, color: Colors.red),
                  onPressed: _logout,
                ),
              ],
            ),
          ),
        ],
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFFF6B00)))
          : RefreshIndicator(
              onRefresh: cargarDatos,
              color: const Color(0xFFFF6B00),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Estado de Mesas',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1A1F2E),
                          ),
                        ),
                        ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pushNamed(context, '/nuevo_pedido')
                                .then((_) => cargarDatos());
                          },
                          icon: const Icon(Icons.add, color: Colors.white),
                          label: const Text(
                            'Nuevo Pedido',
                            style: TextStyle(color: Colors.white),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFCC2200),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: GridView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 1.1,
                      ),
                      itemCount: mesas.length,
                      itemBuilder: (context, index) {
                        final mesa = mesas[index];
                        final ocupada = mesa['estado'] == 'ocupada';
                        return GestureDetector(
                          onTap: () {
                            if (!ocupada) {
                              Navigator.pushNamed(
                                context,
                                '/nuevo_pedido',
                                arguments: mesa,
                              ).then((_) => cargarDatos());
                            }
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: ocupada
                                    ? const Color(0xFFFFCDD2)
                                    : const Color(0xFFC8E6C9),
                                width: 2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.05),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Mesa',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                    letterSpacing: 1,
                                  ),
                                ),
                                Text(
                                  '${mesa['numero_mesa']}',
                                  style: const TextStyle(
                                    fontSize: 48,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1A1F2E),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: ocupada
                                        ? const Color(0xFFFFEBEE)
                                        : const Color(0xFFE8F5E9),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    ocupada ? '🔴 Ocupada' : '🟢 Libre',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: ocupada
                                          ? const Color(0xFFCC2200)
                                          : const Color(0xFF2E7D32),
                                    ),
                                  ),
                                ),
                                if (!ocupada) ...[
                                  const SizedBox(height: 8),
                                  Text(
                                    'Toca para pedir',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: Colors.grey[400],
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: const Color(0xFF1A1F2E),
        selectedItemColor: const Color(0xFFFF6B00),
        unselectedItemColor: Colors.grey,
        currentIndex: 0,
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
          if (index == 1) {
            Navigator.pushNamed(context, '/pedidos');
          }
        },
      ),
    );
  }
}