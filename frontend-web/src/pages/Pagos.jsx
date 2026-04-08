import { useState, useEffect } from "react"
import { obtenerPagos, crearPago, eliminarPago } from "../api/pagoApi"
import { obtenerPedidos } from "../api/pedidoApi"

function Pagos() {
    const [pagos, setPagos] = useState([])
    const [pedidos, setPedidos] = useState([])
    const [idPedido, setIdPedido] = useState('')
    const [tipoPago, setTipoPago] = useState('efectivo')
    const [montoRecibido, setMontoRecibido] = useState('')

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        const [pagosData, pedidosData] = await Promise.all([
            obtenerPagos(),
            obtenerPedidos()
        ])
        setPagos(pagosData)
        setPedidos(pedidosData)
    }

    const handleCrear = async (e) => {
        e.preventDefault()
        try {
            await crearPago({
                id_pedido: parseInt(idPedido),
                tipo_pago: tipoPago,
                monto_recibido: parseFloat(montoRecibido)
            })
            setIdPedido('')
            setTipoPago('efectivo')
            setMontoRecibido('')
            cargarDatos()
        } catch (error) {
            console.error('Error al crear pago:', error.response?.data)
            alert('Error al registrar el pago')
        }
    }

    const handleEliminar = async (id) => {
        await eliminarPago(id)
        cargarDatos()
    }

    const getPedidoInfo = (idPedido) => {
        const pedido = pedidos.find(p => p.id_pedido === idPedido)
        return pedido ? `Pedido #${pedido.id_pedido} - $${pedido.valor_total}` : ''
    }

    return (
        <div>
            <h1>Pagos</h1>

            <form onSubmit={handleCrear}>
                <label htmlFor="id_pedido">Pedido:</label>
                <select
                    id="id_pedido"
                    value={idPedido}
                    onChange={(e) => setIdPedido(e.target.value)}
                    required
                >
                    <option value="">Selecciona un pedido</option>
                    {pedidos.filter(p => p.estado_pedido === 'no_cancelado').map((pedido) => (
                        <option key={pedido.id_pedido} value={pedido.id_pedido}>
                            Pedido #{pedido.id_pedido} - ${pedido.valor_total}
                        </option>
                    ))}
                </select>

                <label htmlFor="tipo_pago">Tipo de Pago:</label>
                <select
                    id="tipo_pago"
                    value={tipoPago}
                    onChange={(e) => setTipoPago(e.target.value)}
                >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                </select>

                <label htmlFor="monto_recibido">Monto Recibido:</label>
                <input
                    type="number"
                    id="monto_recibido"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    required
                />

                <button type="submit">Registrar Pago</button>
            </form>

            <h2>Historial de Pagos</h2>
            <ul>
                {pagos.map((pago) => (
                    <li key={pago.id_pago}>
                        Pago #{pago.id_pago} —
                        {getPedidoInfo(pago.id_pedido)} —
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