import { useState, useEffect } from "react"
import { obtenerTurnos, crearTurno, cerrarTurno, eliminarTurno } from "../api/turnoApi"
import { useAuth } from "../context/AuthContext"

function Turnos() {
    const [turnos, setTurnos] = useState([])
    const [baseTurno, setBaseTurno] = useState('')
    const { usuario } = useAuth()

    useEffect(() => {
        cargarTurnos()
    }, [])

    const cargarTurnos = async () => {
        const data = await obtenerTurnos()
        setTurnos(data)
    }

    const turnoActivo = turnos.find(t => t.estado_turno === 'iniciado')

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

    const handleCerrar = async (id) => {
        await cerrarTurno(id)
        cargarTurnos()
    }

    const handleEliminar = async (id) => {
        await eliminarTurno(id)
        cargarTurnos()
    }

    return (
        <div>
            <h1>Turnos</h1>

            {turnoActivo ? (
                <div>
                    <h2>Turno Activo</h2>
                    <p>Base: ${turnoActivo.base_turno}</p>
                    <p>Ingresos: ${turnoActivo.ingresos_turno}</p>
                    <p>Egresos: ${turnoActivo.egresos_turno}</p>
                    <p>Inicio: {turnoActivo.fecha_turno_inicio.replace('T', ' ').substring(0, 19)}</p>
                    <button onClick={() => handleCerrar(turnoActivo.id_turno)}>
                        Cerrar Turno
                    </button>
                </div>
            ) : (
                <form onSubmit={handleCrear}>
                    <label htmlFor="base_turno">Base de Caja:</label>
                    <input
                        type="number"
                        id="base_turno"
                        value={baseTurno}
                        onChange={(e) => setBaseTurno(e.target.value)}
                        required
                    />
                    <button type="submit">Abrir Turno</button>
                </form>
            )}

            <h2>Historial de Turnos</h2>
            <ul>
                {turnos.map((turno) => (
                    <li key={turno.id_turno}>
                        Turno #{turno.id_turno} —
                        Base: ${turno.base_turno} —
                        Estado: {turno.estado_turno} —
                        Inicio: {turno.fecha_turno_inicio.replace('T', ' ').substring(0, 19)}
                        {turno.fecha_turno_fin && ` — Fin: ${turno.fecha_turno_fin.replace('T', ' ').substring(0, 19)}`}
                        {turno.estado_turno === 'terminado' && (
                            <button onClick={() => handleEliminar(turno.id_turno)}>Eliminar</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Turnos