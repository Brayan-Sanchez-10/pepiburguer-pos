import { useState, useEffect } from "react"
import { obtenerTurnos, crearTurno, cerrarTurno, eliminarTurno, registrarEgreso } from "../api/turnoApi"
import { useAuth } from "../context/AuthContext"
import './Admin.css'

function Turnos() {
    const [turnos, setTurnos] = useState([])
    const [baseTurno, setBaseTurno] = useState('')
    const [montoEgreso, setMontoEgreso] = useState('')
    const [descripcionEgreso, setDescripcionEgreso] = useState('')
    const [reciboTurno, setReciboTurno] = useState(null)
    const { usuario } = useAuth()

    useEffect(() => { cargarTurnos() }, [])

    const cargarTurnos = async () => {
        const data = await obtenerTurnos()
        setTurnos(data)
    }

    const turnoActivo = turnos.find(t => t.estado_turno === 'iniciado')

    const formatPesos = (valor) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor || 0)

    const handleCrear = async (e) => {
        e.preventDefault()
        await crearTurno({
            id_usuario: usuario?.cedula,
            base_turno: parseFloat(baseTurno),
            estado_turno: 'iniciado'
        })
        setBaseTurno('')
        cargarTurnos()
    }

    const handleEgreso = async (e) => {
        e.preventDefault()
        if (!montoEgreso || parseFloat(montoEgreso) <= 0) { alert('Ingresa un monto válido'); return }
        await registrarEgreso(turnoActivo.id_turno, {
            monto: parseFloat(montoEgreso),
            descripcion: descripcionEgreso || null
        })
        setMontoEgreso('')
        setDescripcionEgreso('')
        cargarTurnos()
    }

    const handleCerrar = async (id) => {
        if (window.confirm('¿Cerrar el turno actual?')) {
            setReciboTurno(turnoActivo)
            await cerrarTurno(id)
            cargarTurnos()
        }
    }

    const handleEliminar = async (id) => {
        if (window.confirm('¿Eliminar este turno?')) {
            await eliminarTurno(id)
            cargarTurnos()
        }
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-title">
                    <span>🕐</span>
                    <h1>Turnos</h1>
                </div>
            </div>

            {turnoActivo ? (
                <div className="turno-activo-card">
                    <div className="turno-activo-header">
                        <div>
                            <h2>🟢 Turno Activo #{turnoActivo.id_turno}</h2>
                            <p>Inicio: {turnoActivo.fecha_turno_inicio?.replace('T', ' ').substring(0, 16)}</p>
                        </div>
                        <button className="btn-cerrar-turno" onClick={() => handleCerrar(turnoActivo.id_turno)}>
                            Cerrar Turno
                        </button>
                    </div>
                    <div className="turno-stats-grid">
                        <div className="turno-stat">
                            <span>Base de Caja</span>
                            <strong>{formatPesos(turnoActivo.base_turno)}</strong>
                        </div>
                        <div className="turno-stat ingresos">
                            <span>Ingresos</span>
                            <strong>{formatPesos(turnoActivo.ingresos_turno)}</strong>
                        </div>
                        <div className="turno-stat egresos">
                            <span>Egresos</span>
                            <strong>{formatPesos(turnoActivo.egresos_turno)}</strong>
                        </div>
                        <div className="turno-stat total">
                            <span>Total en Caja</span>
                            <strong>{formatPesos(
                                parseFloat(turnoActivo.base_turno || 0) +
                                parseFloat(turnoActivo.ingresos_turno || 0) -
                                parseFloat(turnoActivo.egresos_turno || 0)
                            )}</strong>
                        </div>
                    </div>

                    <div className="egreso-form">
                        <h3>Registrar Egreso</h3>
                        <form onSubmit={handleEgreso}>
                            <div className="egreso-row">
                                <div className="form-group">
                                    <label>Monto</label>
                                    <input
                                        type="number"
                                        placeholder="$0"
                                        value={montoEgreso}
                                        onChange={(e) => setMontoEgreso(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{flex: 2}}>
                                    <label>Descripción</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Compra de ingredientes"
                                        value={descripcionEgreso}
                                        onChange={(e) => setDescripcionEgreso(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn-egreso">+ Registrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="admin-form-card" style={{maxWidth: '500px'}}>
                    <h2>Abrir Nuevo Turno</h2>
                    <form onSubmit={handleCrear}>
                        <div className="form-group">
                            <label>Base de Caja</label>
                            <input
                                type="number"
                                placeholder="Ej: 100000"
                                value={baseTurno}
                                onChange={(e) => setBaseTurno(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary">🟢 Abrir Turno</button>
                    </form>
                </div>
            )}

            <div className="admin-list-card" style={{marginTop: '24px'}}>
                <h2>Historial de Turnos</h2>
                <div className="admin-list">
                    {turnos.filter(t => t.estado_turno === 'terminado').map((turno) => (
                        <div key={turno.id_turno} className="admin-item">
                            <div className="item-icon">🕐</div>
                            <div className="item-info">
                                <strong>Turno #{turno.id_turno}</strong>
                                <span>Inicio: {turno.fecha_turno_inicio?.replace('T', ' ').substring(0, 16)}</span>
                                <span>Fin: {turno.fecha_turno_fin?.replace('T', ' ').substring(0, 16)}</span>
                            </div>
                            <div className="item-info">
                                <span>Base: {formatPesos(turno.base_turno)}</span>
                                <span style={{color: '#2E7D32'}}>Ingresos: {formatPesos(turno.ingresos_turno)}</span>
                                <span style={{color: '#CC2200'}}>Egresos: {formatPesos(turno.egresos_turno)}</span>
                            </div>
                            <div className="item-acciones">
                                <button className="btn-delete" onClick={() => handleEliminar(turno.id_turno)}>🗑 Eliminar</button>
                            </div>
                        </div>
                    ))}
                    {turnos.filter(t => t.estado_turno === 'terminado').length === 0 && (
                        <p className="empty-msg">No hay turnos anteriores</p>
                    )}
                </div>
            </div>

            {/* RECIBO DE CIERRE DE TURNO */}
            {reciboTurno && (
                <div className="modal-overlay-turno">
                    <div className="recibo-turno" id="recibo-turno-print">
                        <div className="recibo-turno-header">
                            <h2>🍔 PepiBurguer Restaurant</h2>
                            <p>Toda la Gloria sea para Dios</p>
                            <hr />
                            <h3>CIERRE DE TURNO #{reciboTurno.id_turno}</h3>
                        </div>

                        <div className="recibo-turno-fecha">
                            <p>Apertura: {reciboTurno.fecha_turno_inicio?.replace('T', ' ').substring(0, 16)}</p>
                            <p>Cierre: {new Date().toLocaleString('es-CO')}</p>
                        </div>

                        <hr />

                        <div className="recibo-turno-stats">
                            <div className="recibo-row">
                                <span>Base de Caja</span>
                                <strong>{formatPesos(reciboTurno.base_turno)}</strong>
                            </div>
                            <div className="recibo-row">
                                <span>Total Ingresos</span>
                                <strong style={{color: '#2E7D32'}}>{formatPesos(reciboTurno.ingresos_turno)}</strong>
                            </div>
                            <div className="recibo-row">
                                <span>Total Egresos</span>
                                <strong style={{color: '#CC2200'}}>{formatPesos(reciboTurno.egresos_turno)}</strong>
                            </div>
                        </div>

                        <hr />

                        <div className="recibo-row total-final">
                            <span>TOTAL EN CAJA</span>
                            <strong>{formatPesos(
                                parseFloat(reciboTurno.base_turno || 0) +
                                parseFloat(reciboTurno.ingresos_turno || 0) -
                                parseFloat(reciboTurno.egresos_turno || 0)
                            )}</strong>
                        </div>

                        <hr />
                        <p className="recibo-turno-gracias">¡Turno cerrado exitosamente!</p>

                        <div className="recibo-turno-btns">
                            <button className="btn-imprimir-turno" onClick={() => window.print()}>
                                🖨 Imprimir
                            </button>
                            <button className="btn-cerrar-recibo-turno" onClick={() => setReciboTurno(null)}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Turnos