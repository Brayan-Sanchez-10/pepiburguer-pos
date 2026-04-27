import 'package:flutter/material.dart';
import 'package:printing/printing.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

class ReciboPedidoScreen extends StatelessWidget {
  final Map<String, dynamic> pedido;
  final List<Map<String, dynamic>> productos;
  final String tipoPedido;
  final String? nombreMesa;
  final String? nombreCliente;
  final String? direccionCliente;
  final String? barrioCliente;
  final String? celularCliente;

  const ReciboPedidoScreen({
    super.key,
    required this.pedido,
    required this.productos,
    required this.tipoPedido,
    this.nombreMesa,
    this.nombreCliente,
    this.direccionCliente,
    this.barrioCliente,
    this.celularCliente,
  });

  String formatPesos(double valor) {
    return '\$${valor.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
  }

  Future<pw.Document> _generarPDF() async {
    final pdf = pw.Document();
    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.roll80,
        build: (context) => pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Center(
              child: pw.Text('PepiBurguer Restaurant',
                  style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold)),
            ),
            pw.Center(child: pw.Text('Toda la Gloria sea para Dios')),
            pw.Divider(),
            pw.Text('Pedido #${pedido['id_pedido'].toString().padLeft(3, '0')}',
                style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
            pw.Text('Fecha: ${DateTime.now().toString().substring(0, 16)}'),
            pw.Text('Tipo: ${tipoPedido == 'mesa' ? nombreMesa ?? 'Mesa' : tipoPedido == 'domicilio' ? 'Domicilio' : 'Para Llevar'}'),
            if (tipoPedido == 'domicilio') ...[
              pw.Divider(),
              pw.Text('DATOS DEL CLIENTE',
                  style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
              pw.Text('Cliente: ${nombreCliente ?? ''}'),
              pw.Text('Dirección: ${direccionCliente ?? ''}'),
              pw.Text('Barrio: ${barrioCliente ?? ''}'),
              pw.Text('Celular: ${celularCliente ?? ''}'),
            ],
            pw.Divider(),
            pw.Text('PRODUCTOS',
                style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
            ...productos.map((p) => pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Expanded(
                  child: pw.Text(
                    '${p['cantidad']}x ${p['nombre']}${p['nota_especial'] != null ? ' — ${p['nota_especial']}' : ''}',
                  ),
                ),
                pw.Text(formatPesos(p['valor'] * p['cantidad'])),
              ],
            )),
            pw.Divider(),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('TOTAL', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                pw.Text(
                  formatPesos(double.parse(pedido['valor_total'].toString())),
                  style: pw.TextStyle(fontWeight: pw.FontWeight.bold),
                ),
              ],
            ),
            pw.Divider(),
            pw.Center(child: pw.Text('¡Pedido creado exitosamente!')),
          ],
        ),
      ),
    );
    return pdf;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F3F5),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1A1F2E),
        title: const Text(
          'Recibo del Pedido',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.print, color: Colors.white),
            onPressed: () async {
              final pdf = await _generarPDF();
              await Printing.layoutPdf(
                onLayout: (format) async => pdf.save(),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 8,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const Text(
                    '🍔 PepiBurguer Restaurant',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const Text(
                    'Toda la Gloria sea para Dios',
                    style: TextStyle(color: Colors.grey, fontSize: 13),
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Pedido #${pedido['id_pedido'].toString().padLeft(3, '0')}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      Text(
                        DateTime.now().toString().substring(0, 16),
                        style: const TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Text('Tipo: ', style: TextStyle(color: Colors.grey)),
                      Text(
                        tipoPedido == 'mesa'
                            ? nombreMesa ?? 'Mesa'
                            : tipoPedido == 'domicilio'
                                ? 'Domicilio'
                                : 'Para Llevar',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  if (tipoPedido == 'domicilio') ...[
                    const Divider(height: 20),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8F9FA),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('DATOS DEL CLIENTE',
                              style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey,
                                  letterSpacing: 1)),
                          const SizedBox(height: 8),
                          _datoRow('Cliente', nombreCliente ?? ''),
                          _datoRow('Dirección', direccionCliente ?? ''),
                          _datoRow('Barrio', barrioCliente ?? ''),
                          _datoRow('Celular', celularCliente ?? ''),
                        ],
                      ),
                    ),
                  ],
                  const Divider(height: 24),
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text('PRODUCTOS',
                        style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                            letterSpacing: 1)),
                  ),
                  const SizedBox(height: 8),
                  ...productos.map((p) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${p['cantidad']}x ${p['nombre']}',
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  if (p['nota_especial'] != null)
                                    Text(
                                      'Nota: ${p['nota_especial']}',
                                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                                    ),
                                ],
                              ),
                            ),
                            Text(
                              formatPesos(p['valor'] * p['cantidad']),
                              style: const TextStyle(
                                  color: Color(0xFFCC2200), fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      )),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('TOTAL',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Text(
                        formatPesos(double.parse(pedido['valor_total'].toString())),
                        style: const TextStyle(
                            color: Color(0xFFCC2200),
                            fontWeight: FontWeight.bold,
                            fontSize: 18),
                      ),
                    ],
                  ),
                  const Divider(height: 24),
                  const Text(
                    '¡Pedido creado exitosamente!',
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: () async {
                  final pdf = await _generarPDF();
                  await Printing.layoutPdf(
                    onLayout: (format) async => pdf.save(),
                  );
                },
                icon: const Icon(Icons.print, color: Colors.white),
                label: const Text(
                  'IMPRIMIR RECIBO',
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFCC2200),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton(
                onPressed: () => Navigator.pushReplacementNamed(context, '/mesas'),
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Volver a Mesas',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _datoRow(String label, String valor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text('$label: ', style: const TextStyle(color: Colors.grey, fontSize: 13)),
          Text(valor, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }
}