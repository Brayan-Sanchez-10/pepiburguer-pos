import { useState, useEffect } from "react"
import { obtenerMesas, crearMesa, editarMesa, ocuparMesa, eliminarMesa } from "../api/mesaApi"
import './Admin.css'

function Mesas() {
    const [mesas, setMesas] = useState([])
    const [numeroMesa, setNumeroMesa] = useState('')
    const [mesaEditando, setMesaEditando] = useState(null)
    const [numeroEditado, setNumeroEditado] = useState('')

    useEffect(() => { cargarMesas() }, [])

    const cargarMesas = async () => {
        const data = await obtenerMesas()
        setMesas(data)
    }

    const handleCrear = async (e) => {
        e.preventDefault()
        await crearMesa({ numero_mesa: parseInt(numeroMesa), estado: 'vacia' })
        setNumeroMesa('')
        cargarMesas()
    }

    const handleEditar = async (id) => {
        await editarMesa(id, { numero_mesa: parseInt(numeroEditado) })
        setMesaEditando(null)
        cargarMesas()
    }

    const handleOcupar = async (id, estadoActual) => {
        await ocuparMesa(id, { estado: estadoActual === 'ocupada' ? 'vacia' : 'ocupada' })
        cargarMesas()
    }

    const handleEliminar = async (id) => {
        if (window.confirm('¿Eliminar esta mesa?')) {
            await eliminarMesa(id)
            cargarMesas()
        }
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-title">
                    <span>🪑</span>
                    <h1>Mesas</h1>
                </div>
            </div>

            <div className="admin-layout">
                <div className="admin-form-card">
                    <h2>Nueva Mesa</h2>
                    <form onSubmit={handleCrear}>
                        <div className="form-group">
                            <label>Número de Mesa</label>
                            <input
                                type="number"
                                placeholder="Ej: 1"
                                value={numeroMesa}
                                onChange={(e) => setNumeroMesa(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary">+ Agregar Mesa</button>
                    </form>
                </div>

                <div className="admin-list-card">
                    <h2>Mesas Registradas</h2>
                    <div className="mesas-grid">
                        {mesas.map((mesa) => (
                            <div key={mesa.id_mesa} className={`mesa-card ${mesa.estado}`}>
                                {mesaEditando === mesa.id_mesa ? (
                                    <div className="mesa-edit">
                                        <input
                                            type="number"
                                            value={numeroEditado}
                                            onChange={(e) => setNumeroEditado(e.target.value)}
                                        />
                                        <div className="mesa-edit-btns">
                                            <button className="btn-save" onClick={() => handleEditar(mesa.id_mesa)}>✓</button>
                                            <button className="btn-cancel" onClick={() => setMesaEditando(null)}>✕</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mesa-numero">
                                            <strong>Mesa</strong>
                                            <span>{mesa.numero_mesa}</span>
                                        </div>
                                        <div className={`mesa-estado-badge ${mesa.estado}`}>
                                            {mesa.estado === 'ocupada' ? '🔴 Ocupada' : '🟢 Libre'}
                                        </div>
                                        <div className="mesa-acciones">
                                            <button className="btn-icon" onClick={() => handleOcupar(mesa.id_mesa, mesa.estado)}>
                                                {mesa.estado === 'ocupada' ? '🔓' : '🔒'}
                                            </button>
                                            <button className="btn-icon" onClick={() => {
                                                setMesaEditando(mesa.id_mesa)
                                                setNumeroEditado(mesa.numero_mesa)
                                            }}>✏️</button>
                                            <button className="btn-icon danger" onClick={() => handleEliminar(mesa.id_mesa)}>🗑</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {mesas.length === 0 && <p className="empty-msg">No hay mesas registradas</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Mesas