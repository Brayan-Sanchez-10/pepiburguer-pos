import { useState, useEffect } from "react"
import { obtenerPagos } from "../api/pagoApi"
import { obtenerPedidos } from "../api/pedidoApi"
import { obtenerTurnos } from "../api/turnoApi"
import './Pagos.css'

function Pagos() {
    const [pagos, setPagos] = useState([])
    const [pedidos, setPedidos] = useState([])
    const [turnoActivo, setTurnoActivo] = useState(null)
    const [filtroFecha, setFiltroFecha] = useState('')

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        const [pagosData, pedidosData, turnosData] = await Promise.all([
            obtenerPagos(),
            obtenerPedidos(),
            obtenerTurnos()
        ])
        setPagos(pagosData)
        setPedidos(pedidosData)
        const activo = turnosData.find(t => t.estado_turno === 'iniciado')
        setTurnoActivo(activo || null)
    }

    const formatPesos = (valor) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor || 0)

    const getPedidoInfo = (idPedido) =>
        pedidos.find(p => p.id_pedido === idPedido)

    const pagosFiltrados = filtroFecha
        ? pagos.filter(p => p.fecha_pago?.startsWith(filtroFecha))
        : pagos

    const totalEfectivo = pagosFiltrados
        .filter(p => p.tipo_pago === 'efectivo')
        .reduce((sum, p) => sum + parseFloat(p.monto_recibido || 0), 0)

    const totalTransferencia = pagosFiltrados
        .filter(p => p.tipo_pago === 'transferencia')
        .reduce((sum, p) => sum + parseFloat(p.monto_recibido || 0), 0)

    const totalGeneral = totalEfectivo + totalTransferencia

    return (
        <div className="pagos-page">

            <div className="pagos-header">
                <div className="pagos-title">
                    <span>💳</span>
                    <h1>Historial de Caja</h1>
                </div>
                <input
                    type="date"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                    className="filtro-fecha"
                />
            </div>

            {/* RESUMEN */}
            <div className="pagos-resumen">
                <div className="resumen-card total">
                    <span>💰 Total Recaudado</span>
                    <strong>{formatPesos(totalGeneral)}</strong>
                    <small>{pagosFiltrados.length} pagos</small>
                </div>
                <div className="resumen-card efectivo">
                    <span>💵 Efectivo</span>
                    <strong>{formatPesos(totalEfectivo)}</strong>
                    <small>{pagosFiltrados.filter(p => p.tipo_pago === 'efectivo').length} pagos</small>
                </div>
                <div className="resumen-card transferencia">
                    <span>📱 Transferencia</span>
                    <strong>{formatPesos(totalTransferencia)}</strong>
                    <small>{pagosFiltrados.filter(p => p.tipo_pago === 'transferencia').length} pagos</small>
                </div>
                {turnoActivo && (
                    <div className="resumen-card turno">
                        <span>🕐 Turno Activo</span>
                        <strong>{formatPesos(turnoActivo.ingresos_turno)}</strong>
                        <small>Ingresos del turno</small>
                    </div>
                )}
            </div>

            {/* LISTA DE PAGOS */}
            <div className="pagos-lista-container">
                <h2>Detalle de Pagos</h2>
                <div className="pagos-lista">
                    {pagosFiltrados.length === 0 && (
                        <p className="empty-msg">No hay pagos registrados</p>
                    )}
                    {pagosFiltrados.map((pago) => {
                        const pedido = getPedidoInfo(pago.id_pedido)
                        return (
                            <div className="pago-item" key={pago.id_pago}>
                                <div className="pago-numero">
                                    #{String(pago.id_pago).padStart(3, '0')}
                                </div>
                                <div className="pago-info">
                                    <strong>Pedido #{String(pago.id_pedido).padStart(3, '0')}</strong>
                                    <span>
                                        {pedido?.tipo_pedido === 'mesa' ? `Mesa ${pedido?.id_mesa}` :
                                         pedido?.tipo_pedido === 'domicilio' ? 'Domicilio' : 'Para Llevar'}
                                    </span>
                                    <small>{pago.fecha_pago?.replace('T', ' ').substring(0, 16)}</small>
                                </div>
                                <div className="pago-metodo">
                                    <span className={`badge-pago ${pago.tipo_pago}`}>
                                        {pago.tipo_pago === 'efectivo' ? '💵 Efectivo' : '📱 Transferencia'}
                                    </span>
                                </div>
                                <div className="pago-montos">
                                    <strong>{formatPesos(pago.monto_recibido)}</strong>
                                    {pago.tipo_pago === 'efectivo' && parseFloat(pago.cambio) > 0 && (
                                        <small>Cambio: {formatPesos(pago.cambio)}</small>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Pagos