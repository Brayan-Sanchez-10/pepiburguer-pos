import 'package:flutter/material.dart';
import '../api/api_service.dart';

class NuevoPedidoScreen extends StatefulWidget {
  const NuevoPedidoScreen({super.key});

  @override
  State<NuevoPedidoScreen> createState() => _NuevoPedidoScreenState();
}

class _NuevoPedidoScreenState extends State<NuevoPedidoScreen> {
  List<dynamic> categorias = [];
  List<dynamic> productos = [];
  List<dynamic> mesas = [];
  List<Map<String, dynamic>> productosSeleccionados = [];

  dynamic categoriaSeleccionada;
  dynamic productoActual;
  String notaActual = '';
  String tipoPedido = 'mesa';
  dynamic mesaSeleccionada;
  bool loading = true;
  bool creando = false;

  int? _mesaArgumentoId;

  int? idTurno;

  final _notaController = TextEditingController();
  final _nombreController = TextEditingController();
  final _direccionController = TextEditingController();
  final _barrioController = TextEditingController();
  final _celularController = TextEditingController();

  @override
  void initState() {
    super.initState();
    cargarDatos();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final mesa = ModalRoute.of(context)?.settings.arguments as Map?;
    if (mesa != null && _mesaArgumentoId == null) {
      _mesaArgumentoId = mesa['id_mesa'];
      tipoPedido = 'mesa';
    }
  }

  Future<void> cargarDatos() async {
    final cats = await getCategorias();
    final prods = await getProductos();
    final ms = await getMesas();
    final turnos = await getTurnos();
    final turnoActivo = turnos.where((t) => t['estado_turno'] == 'iniciado').toList();

    final mesasVacias = ms.where((m) => m['estado'] == 'vacia').toList();

    dynamic mesaSincronizada;
    if (_mesaArgumentoId != null) {
      final encontrada = mesasVacias.where(
        (m) => m['id_mesa'] == _mesaArgumentoId
      ).toList();
      mesaSincronizada = encontrada.isNotEmpty ? encontrada.first : null;
    }

    setState(() {
      categorias = cats;
      productos = prods;
      mesas = mesasVacias;
      idTurno = turnoActivo.isNotEmpty ? turnoActivo.first['id_turno'] : null;
      mesaSeleccionada = mesaSincronizada;
      loading = false;
    });
  }

  double calcularTotal() {
    return productosSeleccionados.fold(
      0,
      (sum, p) => sum + (p['valor'] * p['cantidad']),
    );
  }

  void agregarProducto() {
    if (productoActual == null) return;
    final existe = productosSeleccionados.indexWhere(
      (p) => p['id_producto'] == productoActual['id_producto'],
    );
    if (existe >= 0) {
      setState(() {
        productosSeleccionados[existe]['cantidad']++;
      });
    } else {
      setState(() {
        productosSeleccionados.add({
          'id_producto': productoActual['id_producto'],
          'nombre': productoActual['nombre_producto'],
          'valor': double.parse(productoActual['valor_producto'].toString()),
          'cantidad': 1,
          'nota_especial': notaActual.isEmpty ? null : notaActual,
        });
      });
    }
    setState(() {
      productoActual = null;
      categoriaSeleccionada = null;
      notaActual = '';
      _notaController.clear();
    });
  }

  Future<void> crearPedidoFinal() async {
    if (idTurno == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No hay turno activo'), backgroundColor: Colors.red),
      );
      return;
    }
    if (productosSeleccionados.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Agrega al menos un producto'), backgroundColor: Colors.red),
      );
      return;
    }
    if (tipoPedido == 'mesa' && mesaSeleccionada == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecciona una mesa'), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => creando = true);

    final pedido = await crearPedido({
      'valor_total': calcularTotal(),
      'id_turno': idTurno,
      'id_mesa': tipoPedido == 'mesa' ? mesaSeleccionada['id_mesa'] : null,
      'tipo_pedido': tipoPedido,
      'estado_pedido': 'no_cancelado',
    });

    if (pedido != null) {
      for (final prod in productosSeleccionados) {
        await agregarProductoPedido({
          'id_pedido': pedido['id_pedido'],
          'id_producto': prod['id_producto'],
          'cantidad': prod['cantidad'],
          'nota_especial': prod['nota_especial'],
        });
      }

      if (tipoPedido == 'domicilio') {
        await crearDomicilio({
          'nombre_cliente': _nombreController.text,
          'direccion_cliente': _direccionController.text,
          'barrio_cliente': _barrioController.text,
          'celular_cliente': _celularController.text,
          'id_pedido': pedido['id_pedido'],
        });
      }

      if (mounted) {
        Navigator.pushReplacementNamed(
          context,
          '/recibo_pedido',
          arguments: {
            'pedido': pedido,
            'productos': List<Map<String, dynamic>>.from(productosSeleccionados),
            'tipoPedido': tipoPedido,
            'nombreMesa': mesaSeleccionada != null
                ? 'Mesa ${mesaSeleccionada['numero_mesa']}'
                : null,
            'nombreCliente': _nombreController.text,
            'direccionCliente': _direccionController.text,
            'barrioCliente': _barrioController.text,
            'celularCliente': _celularController.text,
          },
        );
      }
    } else {
      setState(() => creando = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error al crear pedido'), backgroundColor: Colors.red),
        );
      }
    }
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
          'Nuevo Pedido',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFFF6B00)))
          : Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [

                        // TIPO DE PEDIDO
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8)],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('TIPO DE PEDIDO',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  _tipoPedidoBtn('mesa', '🪑 Mesa'),
                                  const SizedBox(width: 8),
                                  _tipoPedidoBtn('para_llevar', '🥡 Para Llevar'),
                                  const SizedBox(width: 8),
                                  _tipoPedidoBtn('domicilio', '🛵 Domicilio'),
                                ],
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 12),

                        // MESA
                        if (tipoPedido == 'mesa')
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8)],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('MESA',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                                const SizedBox(height: 10),
                                GridView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 3,
                                    crossAxisSpacing: 8,
                                    mainAxisSpacing: 8,
                                    childAspectRatio: 1.5,
                                  ),
                                  itemCount: mesas.length,
                                  itemBuilder: (context, index) {
                                    final mesa = mesas[index];
                                    final seleccionada = mesaSeleccionada != null &&
                                        mesaSeleccionada['id_mesa'] == mesa['id_mesa'];
                                    return GestureDetector(
                                      onTap: () => setState(() => mesaSeleccionada = mesa),
                                      child: Container(
                                        decoration: BoxDecoration(
                                          gradient: seleccionada
                                              ? const LinearGradient(colors: [Color(0xFFFF6B00), Color(0xFFCC2200)])
                                              : null,
                                          color: seleccionada ? null : const Color(0xFFF1F3F5),
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(
                                            color: seleccionada ? Colors.transparent : const Color(0xFFDDDDDD),
                                          ),
                                        ),
                                        child: Center(
                                          child: Text(
                                            'Mesa ${mesa['numero_mesa']}',
                                            style: TextStyle(
                                              color: seleccionada ? Colors.white : Colors.grey[700],
                                              fontWeight: FontWeight.bold,
                                              fontSize: 13,
                                            ),
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ],
                            ),
                          ),

                        // DOMICILIO
                        if (tipoPedido == 'domicilio')
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8)],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('DATOS DEL CLIENTE',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                                const SizedBox(height: 10),
                                _inputField(_nombreController, 'Nombre del cliente'),
                                const SizedBox(height: 8),
                                _inputField(_direccionController, 'Dirección'),
                                const SizedBox(height: 8),
                                _inputField(_barrioController, 'Barrio'),
                                const SizedBox(height: 8),
                                _inputField(_celularController, 'Celular', TextInputType.phone),
                              ],
                            ),
                          ),

                        const SizedBox(height: 12),

                        // SELECTOR CATEGORÍAS / PRODUCTOS
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8)],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    productoActual != null
                                        ? 'CONFIRMAR PRODUCTO'
                                        : categoriaSeleccionada != null
                                            ? 'PRODUCTOS — ${categoriaSeleccionada['nombre_categoria']}'
                                            : 'SELECCIONA CATEGORÍA',
                                    style: const TextStyle(
                                        fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1),
                                  ),
                                  if (categoriaSeleccionada != null)
                                    GestureDetector(
                                      onTap: () => setState(() {
                                        categoriaSeleccionada = null;
                                        productoActual = null;
                                        _notaController.clear();
                                      }),
                                      child: const Text('← Volver',
                                          style: TextStyle(color: Color(0xFFFF6B00), fontWeight: FontWeight.bold, fontSize: 13)),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 12),

                              // CATEGORÍAS
                              if (categoriaSeleccionada == null)
                                GridView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 2,
                                    crossAxisSpacing: 8,
                                    mainAxisSpacing: 8,
                                    childAspectRatio: 2.5,
                                  ),
                                  itemCount: categorias.length,
                                  itemBuilder: (context, index) {
                                    final cat = categorias[index];
                                    return GestureDetector(
                                      onTap: () => setState(() {
                                        categoriaSeleccionada = cat;
                                        productoActual = null;
                                      }),
                                      child: Container(
                                        decoration: BoxDecoration(
                                          gradient: const LinearGradient(
                                            colors: [Color(0xFFFF6B00), Color(0xFFCC2200)],
                                          ),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Center(
                                          child: Text(
                                            '🍽 ${cat['nombre_categoria']}',
                                            style: const TextStyle(
                                                color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                            textAlign: TextAlign.center,
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),

                              // PRODUCTOS
                              if (categoriaSeleccionada != null && productoActual == null)
                                GridView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 2,
                                    crossAxisSpacing: 8,
                                    mainAxisSpacing: 8,
                                    childAspectRatio: 2,
                                  ),
                                  itemCount: productos
                                      .where((p) =>
                                          p['id_categoria'] == categoriaSeleccionada['id_categoria'] &&
                                          p['disponible'] == true)
                                      .length,
                                  itemBuilder: (context, index) {
                                    final filtered = productos
                                        .where((p) =>
                                            p['id_categoria'] == categoriaSeleccionada['id_categoria'] &&
                                            p['disponible'] == true)
                                        .toList();
                                    final pro = filtered[index];
                                    return GestureDetector(
                                      onTap: () => setState(() => productoActual = pro),
                                      child: Container(
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(color: const Color(0xFFFF6B00), width: 2),
                                        ),
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Text(
                                              pro['nombre_producto'],
                                              style: const TextStyle(
                                                  fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1A1F2E)),
                                              textAlign: TextAlign.center,
                                            ),
                                            Text(
                                              formatPesos(double.parse(pro['valor_producto'].toString())),
                                              style: const TextStyle(color: Color(0xFFCC2200), fontSize: 12),
                                            ),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                ),

                              // CONFIRMAR PRODUCTO
                              if (productoActual != null)
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8F9FA),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFFFF6B00), width: 2),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            productoActual['nombre_producto'],
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                          ),
                                          Text(
                                            formatPesos(double.parse(productoActual['valor_producto'].toString())),
                                            style: const TextStyle(color: Color(0xFFCC2200), fontWeight: FontWeight.bold),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      TextField(
                                        controller: _notaController,
                                        onChanged: (val) => notaActual = val,
                                        decoration: InputDecoration(
                                          hintText: 'Nota especial (opcional) ej: sin cebolla',
                                          filled: true,
                                          fillColor: Colors.white,
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(8),
                                            borderSide: const BorderSide(color: Color(0xFFDDDDDD)),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 10),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: OutlinedButton(
                                              onPressed: () => setState(() {
                                                productoActual = null;
                                                _notaController.clear();
                                                notaActual = '';
                                              }),
                                              child: const Text('← Volver'),
                                            ),
                                          ),
                                          const SizedBox(width: 10),
                                          Expanded(
                                            flex: 2,
                                            child: ElevatedButton(
                                              onPressed: agregarProducto,
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: const Color(0xFFFF6B00),
                                              ),
                                              child: const Text('+ Agregar',
                                                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 12),

                        // PRODUCTOS SELECCIONADOS
                        if (productosSeleccionados.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8)],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('PEDIDO',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                                const SizedBox(height: 10),
                                ...productosSeleccionados.map((p) => Padding(
                                      padding: const EdgeInsets.symmetric(vertical: 4),
                                      child: Row(
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text('${p['cantidad']}x ${p['nombre']}',
                                                    style: const TextStyle(fontWeight: FontWeight.bold)),
                                                if (p['nota_especial'] != null)
                                                  Text('Nota: ${p['nota_especial']}',
                                                      style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                              ],
                                            ),
                                          ),
                                          Text(
                                            formatPesos(p['valor'] * p['cantidad']),
                                            style: const TextStyle(color: Color(0xFFCC2200), fontWeight: FontWeight.bold),
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.close, color: Colors.red, size: 18),
                                            onPressed: () => setState(() => productosSeleccionados.removeWhere(
                                                (x) => x['id_producto'] == p['id_producto'])),
                                          ),
                                        ],
                                      ),
                                    )),
                                const Divider(),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('TOTAL',
                                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                    Text(
                                      formatPesos(calcularTotal()),
                                      style: const TextStyle(
                                          color: Color(0xFFCC2200), fontWeight: FontWeight.bold, fontSize: 18),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),

                        const SizedBox(height: 80),
                      ],
                    ),
                  ),
                ),

                // BOTÓN CREAR PEDIDO
                Container(
                  padding: const EdgeInsets.all(16),
                  color: Colors.white,
                  child: SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: creando ? null : crearPedidoFinal,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFCC2200),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: creando
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text(
                              'CREAR PEDIDO',
                              style: TextStyle(
                                  color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 2),
                            ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _tipoPedidoBtn(String tipo, String label) {
    final activo = tipoPedido == tipo;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() {
          tipoPedido = tipo;
          mesaSeleccionada = null;
        }),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            gradient: activo
                ? const LinearGradient(colors: [Color(0xFFFF6B00), Color(0xFFCC2200)])
                : null,
            color: activo ? null : const Color(0xFFF1F3F5),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: activo ? Colors.white : Colors.grey,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _inputField(TextEditingController controller, String hint,
      [TextInputType type = TextInputType.text]) {
    return TextField(
      controller: controller,
      keyboardType: type,
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: const Color(0xFFF8F9FA),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
}