import { useState, useEffect } from "react"
import { obtenerPagos, crearPago, eliminarPago } from "../api/pagoApi"
import { obtenerPedidos } from "../api/pedidoApi"
import { obtenerMesas } from "../api/mesaApi"
import { obtenerPedidoProductos } from "../api/pedidoProductoApi"
import { obtenerProductos } from "../api/productoApi"

function Pagos() {
    const [pagos, setPagos] = useState([])
    const [pedidos, setPedidos] = useState([])
    const [mesas, setMesas] = useState([])
    const [pedidoProductos, setPedidoProductos] = useState([])
    const [productos, setProductos] = useState([])

    // Modal de pago
    const [mesaSeleccionada, setMesaSeleccionada] = useState(null)
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
    const [tipoPago, setTipoPago] = useState('efectivo')
    const [montoRecibido, setMontoRecibido] = useState('')
    const [pagoRealizado, setPagoRealizado] = useState(null)

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        const [pagosData, pedidosData, mesasData, pedidoProductosData, productosData] = await Promise.all([
            obtenerPagos(),
            obtenerPedidos(),
            obtenerMesas(),
            obtenerPedidoProductos(),
            obtenerProductos()
        ])
        setPagos(pagosData)
        setPedidos(pedidosData)
        setMesas(mesasData)
        setPedidoProductos(pedidoProductosData)
        setProductos(productosData)
    }

    const getPedidoDeMesa = (idMesa) => {
        return pedidos.find(p => p.id_mesa === idMesa && p.estado_pedido === 'no_cancelado')
    }

    const getProductosPedido = (idPedido) => {
        return pedidoProductos.filter(pp => pp.id_pedido === idPedido)
    }

    const getNombreProducto = (idProducto) => {
        const producto = productos.find(p => p.id_producto === idProducto)
        return producto ? producto.nombre_producto : ''
    }

    const getValorProducto = (idProducto) => {
        const producto = productos.find(p => p.id_producto === idProducto)
        return producto ? parseFloat(producto.valor_producto) : 0
    }

    const calcularCambio = () => {
        if (!pedidoSeleccionado || !montoRecibido) return 0
        if (tipoPago === 'transferencia') return 0
        return parseFloat(montoRecibido) - parseFloat(pedidoSeleccionado.valor_total)
    }

    const handleSeleccionarMesa = (mesa) => {
        const pedido = getPedidoDeMesa(mesa.id_mesa)
        if (!pedido) return
        setMesaSeleccionada(mesa)
        setPedidoSeleccionado(pedido)
        setTipoPago('efectivo')
        setMontoRecibido('')
        setPagoRealizado(null)
    }

    const handleRegistrarPago = async (e) => {
        e.preventDefault()

        if (tipoPago === 'efectivo' && parseFloat(montoRecibido) < parseFloat(pedidoSeleccionado.valor_total)) {
            alert('El monto recibido es menor al total del pedido')
            return
        }

        try {
            const nuevoPago = await crearPago({
                id_pedido: pedidoSeleccionado.id_pedido,
                tipo_pago: tipoPago,
                monto_recibido: tipoPago === 'transferencia'
                    ? parseFloat(pedidoSeleccionado.valor_total)
                    : parseFloat(montoRecibido)
            })

            setPagoRealizado({
                ...nuevoPago,
                pedido: pedidoSeleccionado,
                productos: getProductosPedido(pedidoSeleccionado.id_pedido),
                mesa: mesaSeleccionada
            })

            cargarDatos()
        } catch (error) {
            console.error('Error al crear pago:', error.response?.data)
            alert('Error al registrar el pago')
        }
    }

    const handleImprimirRecibo = () => {
        window.print()
    }

    const handleCerrarModal = () => {
        setMesaSeleccionada(null)
        setPedidoSeleccionado(null)
        setPagoRealizado(null)
        setMontoRecibido('')
        setTipoPago('efectivo')
    }

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este pago?')) {
            await eliminarPago(id)
            cargarDatos()
        }
    }

    return (
        <div>
            <h1>Pagos</h1>

            {/* VISTA DE MESAS */}
            <h2>Estado de Mesas</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {mesas.map((mesa) => {
                    const pedido = getPedidoDeMesa(mesa.id_mesa)
                    return (
                        <div
                            key={mesa.id_mesa}
                            style={{
                                border: '2px solid',
                                borderColor: pedido ? 'red' : 'green',
                                padding: '10px',
                                cursor: pedido ? 'pointer' : 'default',
                                minWidth: '150px'
                            }}
                            onClick={() => pedido && handleSeleccionarMesa(mesa)}
                        >
                            <strong>Mesa {mesa.numero_mesa}</strong>
                            <p>{pedido ? `OCUPADA` : 'LIBRE'}</p>
                            {pedido && (
                                <>
                                    <p>Pedido #{pedido.id_pedido}</p>
                                    <p>Total: ${pedido.valor_total}</p>
                                    <p>Click para pagar</p>
                                </>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* PEDIDOS SIN MESA (domicilio / para llevar) */}
            <h2>Pedidos sin Mesa</h2>
            <ul>
                {pedidos
                    .filter(p => p.estado_pedido === 'no_cancelado' && !p.id_mesa)
                    .map((pedido) => (
                        <li key={pedido.id_pedido}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                setPedidoSeleccionado(pedido)
                                setMesaSeleccionada(null)
                                setPagoRealizado(null)
                                setMontoRecibido('')
                            }}
                        >
                            Pedido #{pedido.id_pedido} — {pedido.tipo_pedido} — Total: ${pedido.valor_total} — Click para pagar
                        </li>
                    ))}
            </ul>

            {/* MODAL DE PAGO */}
            {pedidoSeleccionado && !pagoRealizado && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', minWidth: '400px' }}>
                        <h2>Pago — {mesaSeleccionada ? `Mesa ${mesaSeleccionada.numero_mesa}` : pedidoSeleccionado.tipo_pedido}</h2>
                        <p>Pedido #{pedidoSeleccionado.id_pedido}</p>

                        <h3>Productos:</h3>
                        <ul>
                            {getProductosPedido(pedidoSeleccionado.id_pedido).map((pp) => (
                                <li key={pp.id_pe_pro}>
                                    {getNombreProducto(pp.id_producto)} x{pp.cantidad} —
                                    ${getValorProducto(pp.id_producto) * pp.cantidad}
                                </li>
                            ))}
                        </ul>

                        <p><strong>Total: ${pedidoSeleccionado.valor_total}</strong></p>

                        <form onSubmit={handleRegistrarPago}>
                            <label>Tipo de Pago:</label>
                            <select value={tipoPago} onChange={(e) => setTipoPago(e.target.value)}>
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                            </select>

                            {tipoPago === 'efectivo' && (
                                <>
                                    <label>Monto Recibido:</label>
                                    <input
                                        type="number"
                                        value={montoRecibido}
                                        onChange={(e) => setMontoRecibido(e.target.value)}
                                        required
                                    />
                                    {montoRecibido && (
                                        <p>Cambio: ${calcularCambio()}</p>
                                    )}
                                </>
                            )}

                            <button type="submit">Registrar Pago</button>
                            <button type="button" onClick={handleCerrarModal}>Cancelar</button>
                        </form>
                    </div>
                </div>
            )}

            {/* RECIBO DE PAGO */}
            {pagoRealizado && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div id="recibo" style={{ backgroundColor: 'white', padding: '20px', minWidth: '300px' }}>
                        <h2>PepiBurguer POS</h2>
                        <p>Fecha: {new Date().toLocaleString()}</p>
                        <hr />
                        <p>Pedido #{pagoRealizado.pedido.id_pedido}</p>
                        {pagoRealizado.mesa && <p>Mesa: {pagoRealizado.mesa.numero_mesa}</p>}
                        <hr />
                        <h3>Productos:</h3>
                        <ul>
                            {pagoRealizado.productos.map((pp) => (
                                <li key={pp.id_pe_pro}>
                                    {getNombreProducto(pp.id_producto)} x{pp.cantidad} —
                                    ${getValorProducto(pp.id_producto) * pp.cantidad}
                                </li>
                            ))}
                        </ul>
                        <hr />
                        <p><strong>Total: ${pagoRealizado.pedido.valor_total}</strong></p>
                        <p>Tipo de pago: {pagoRealizado.tipo_pago}</p>
                        <p>Monto recibido: ${pagoRealizado.monto_recibido}</p>
                        <p>Cambio: ${pagoRealizado.cambio}</p>
                        <hr />
                        <p>¡Gracias por su visita!</p>
                        <button onClick={handleImprimirRecibo}>Imprimir Recibo</button>
                        <button onClick={handleCerrarModal}>Cerrar</button>
                    </div>
                </div>
            )}

            {/* HISTORIAL DE PAGOS */}
            <h2>Historial de Pagos</h2>
            <ul>
                {pagos.map((pago) => (
                    <li key={pago.id_pago}>
                        Pago #{pago.id_pago} —
                        Pedido #{pago.id_pedido} —
                        Tipo: {pago.tipo_pago} —
                        Monto: ${pago.monto_recibido} —
                        Cambio: ${pago.cambio}
                        <button onClick={() => handleEliminar(pago.id_pago)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Pagos