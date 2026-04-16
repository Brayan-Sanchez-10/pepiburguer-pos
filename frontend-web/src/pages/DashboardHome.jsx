import { useState, useEffect } from 'react'
import { obtenerPedidos } from '../api/pedidoApi'
import { obtenerMesas } from '../api/mesaApi'
import { obtenerTurnos } from '../api/turnoApi'
import { useNavigate } from 'react-router-dom'
import './DashboardHome.css'

function DashboardHome() {
    const [pedidos, setPedidos] = useState([])
    const [mesas, setMesas] = useState([])
    const [turnoActivo, setTurnoActivo] = useState(null)
    const [hora, setHora] = useState(new Date().toLocaleTimeString())
    const navigate = useNavigate()

    useEffect(() => {
        cargarDatos()
        const interval = setInterval(() => {
            setHora(new Date().toLocaleTimeString())
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const cargarDatos = async () => {
        const [pedidosData, mesasData, turnosData] = await Promise.all([
            obtenerPedidos(),
            obtenerMesas(),
            obtenerTurnos()
        ])
        setPedidos(pedidosData)
        setMesas(mesasData)
        const activo = turnosData.find(t => t.estado_turno === 'iniciado')
        setTurnoActivo(activo || null)
    }

    const pedidosActivos = pedidos.filter(p => p.estado_pedido === 'no_cancelado')
    const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada')
    const ventasDia = pedidos
        .filter(p => p.estado_pedido === 'cancelado')
        .reduce((sum, p) => sum + parseFloat(p.valor_total || 0), 0)

    const formatPesos = (valor) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor)

    return (
        <div className="dashboard-home">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>🕐 Última actualización: {hora}</p>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <span>Ventas del Día</span>
                        <h2>{formatPesos(ventasDia)}</h2>
                    </div>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FF6B00, #CC2200)' }}>
                        💰
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span>Pedidos Activos</span>
                        <h2>{pedidosActivos.length}</h2>
                        <small>{pedidosActivos.length} en preparación</small>
                    </div>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FF6B00, #FF8C00)' }}>
                        📋
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span>Mesas Ocupadas</span>
                        <h2>{mesasOcupadas.length}/{mesas.length}</h2>
                        <small>{mesas.length > 0 ? Math.round((mesasOcupadas.length / mesas.length) * 100) : 0}% ocupación</small>
                    </div>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #FFD700, #FF8C00)' }}>
                        🪑
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span>Ingresos Turno</span>
                        <h2>{turnoActivo ? formatPesos(turnoActivo.ingresos_turno) : '$0'}</h2>
                        <small>Turno actual</small>
                    </div>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #00C853, #00897B)' }}>
                        📈
                    </div>
                </div>
            </div>

            {/* PEDIDOS RECIENTES Y TURNO */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>Pedidos Recientes</h2>
                        <button className="btn-ver-todos" onClick={() => navigate('/dashboard/pedidos')}>
                            Ver todos
                        </button>
                    </div>
                    <div className="pedidos-list">
                        {pedidosActivos.slice(0, 5).map((pedido, index) => (
                            <div className="pedido-item" key={pedido.id_pedido}>
                                <div className="pedido-numero">
                                    #{String(pedido.id_pedido).padStart(3, '0')}
                                </div>
                                <div className="pedido-info">
                                    <strong>
                                        {pedido.tipo_pedido === 'mesa' ? `Mesa ${pedido.id_mesa}` :
                                         pedido.tipo_pedido === 'domicilio' ? 'Domicilio' : 'Para Llevar'}
                                    </strong>
                                    <span className={`badge badge-pendiente`}>Pendiente</span>
                                    <p>{pedido.tipo_pedido}</p>
                                </div>
                                <div className="pedido-total">
                                    {formatPesos(pedido.valor_total)}
                                </div>
                            </div>
                        ))}
                        {pedidosActivos.length === 0 && (
                            <p className="empty-msg">No hay pedidos activos</p>
                        )}
                    </div>
                </div>
            </div>

            {/* TURNO ACTUAL */}
            {turnoActivo && (
                <div className="turno-bar">
                    <div className="turno-icon">🕐</div>
                    <div className="turno-info">
                        <strong>Turno Actual</strong>
                        <span>Inicio: {turnoActivo.fecha_turno_inicio?.replace('T', ' ').substring(0, 16)}</span>
                    </div>
                    <div className="turno-stats">
                        <div>
                            <small>Base de Caja</small>
                            <strong>{formatPesos(turnoActivo.base_turno)}</strong>
                        </div>
                        <div>
                            <small>Ingresos</small>
                            <strong style={{ color: '#FF6B00' }}>{formatPesos(turnoActivo.ingresos_turno)}</strong>
                        </div>
                        <div>
                            <small>Egresos</small>
                            <strong style={{ color: '#FF4444' }}>{formatPesos(turnoActivo.egresos_turno)}</strong>
                        </div>
                    </div>
                    <button className="btn-cerrar-turno" onClick={() => navigate('/dashboard/turnos')}>
                        Ver Turno
                    </button>
                </div>
            )}
        </div>
    )
}

export default DashboardHome