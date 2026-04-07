import { useState, useEffect } from "react"
import { obtenerMesas, crearMesa, editarMesa, ocuparMesa, eliminarMesa } from "../api/mesaApi"

function Mesas() {
    const [mesas, setMesas] = useState([])
    const [numeroMesa, setNumeroMesa] = useState('')
    const [mesaEditando, setMesaEditando] = useState(null)
    const [numeroEditado, setNumeroEditado] = useState('')

    useEffect(() => {
        cargarMesas()
    }, [])

    const cargarMesas = async () => {
        const data = await obtenerMesas()
        setMesas(data)
    }

    const handleCrear = async (e) => {
        e.preventDefault()
        await crearMesa({
            numero_mesa: parseInt(numeroMesa),
            estado: 'vacia'
        })
        setNumeroMesa('')
        cargarMesas()
    }

    const handleEditar = async (id) => {
        await editarMesa(id, {
            numero_mesa: parseInt(numeroEditado)
        })
        setMesaEditando(null)
        cargarMesas()
    }

    const handleOcupar = async (id, estadoActual) => {
        if (estadoActual === 'ocupada') {
            await ocuparMesa(id, { estado: 'vacia' })
        } else {
            await ocuparMesa(id, { estado: 'ocupada' })
        }
        cargarMesas()
    }

    const handleEliminar = async (id) => {
        await eliminarMesa(id)
        cargarMesas()
    }

    return (
        <div>
            <h1>Mesas</h1>

            <form onSubmit={handleCrear}>
                <label htmlFor="numero_mesa">Numero de Mesa:</label>
                <input
                    type="number"
                    id="numero_mesa"
                    value={numeroMesa}
                    onChange={(e) => setNumeroMesa(e.target.value)}
                    required
                />
                <button type="submit">Crear Mesa</button>
            </form>

            <ul>
                {mesas.map((mesa) => (
                    <li key={mesa.id_mesa}>
                        {mesaEditando === mesa.id_mesa ? (
                            <>
                                <input
                                    type="number"
                                    value={numeroEditado}
                                    onChange={(e) => setNumeroEditado(e.target.value)}
                                />
                                <button onClick={() => handleEditar(mesa.id_mesa)}>Guardar</button>
                                <button onClick={() => setMesaEditando(null)}>Cancelar</button>
                            </>
                        ) : (
                            <>
                                Mesa {mesa.numero_mesa} - {mesa.estado}
                                <button onClick={() => {
                                    setMesaEditando(mesa.id_mesa)
                                    setNumeroEditado(mesa.numero_mesa)
                                }}>Editar</button>
                                <button onClick={() => handleOcupar(mesa.id_mesa, mesa.estado)}>
                                    {mesa.estado === 'ocupada' ? 'Liberar' : 'Ocupar'}
                                </button>
                                <button onClick={() => handleEliminar(mesa.id_mesa)}>Eliminar</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Mesas