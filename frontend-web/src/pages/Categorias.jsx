import { useState, useEffect } from "react"
import { obtenerCategorias, crearCategoria, editarCategoria, eliminarCategoria } from "../api/categoriaApi"

function Categorias() {
    const [categorias, setCategorias] = useState([])
    const [nombre, setNombre] = useState('')
    const [categoriaEditando, setCategoriaEditando] = useState(null)
    const [nombreEditado, setNombreEditado] = useState('')

    useEffect(() => {
        cargarCategorias()
    }, [])

    const cargarCategorias = async () => {
        const data = await obtenerCategorias()
        setCategorias(data)
    }

    const handleCrear = async (e) => {
        e.preventDefault()
        await crearCategoria({ nombre_categoria: nombre })
        setNombre('')
        cargarCategorias()
    }

    const handleEditar = async (id, data) => {
        await editarCategoria(id, data)
        setCategoriaEditando(null)
        cargarCategorias()
    }

    const handleEliminar = async (id) => {
        await eliminarCategoria(id)
        cargarCategorias()
    }

    return (
        <div>
            <h1>Categorias</h1>

            <form onSubmit={handleCrear}>
                <label htmlFor="nombre_categoria">Nombre Categoria:</label>
                <input
                    type="text"
                    id="nombre_categoria"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
                <button type="submit">Crear Categoria</button>
            </form>

            <ul>
                {categorias.map((cat) => (
                    <li key={cat.id_categoria}>
                        {categoriaEditando === cat.id_categoria ? (
                            <>
                                <input
                                    value={nombreEditado}
                                    onChange={(e) => setNombreEditado(e.target.value)}
                                />
                                <button onClick={() => handleEditar(cat.id_categoria, { nombre_categoria: nombreEditado })}>Guardar</button>
                                <button onClick={() => setCategoriaEditando(null)}>Cancelar</button>
                            </>
                        ) : (
                            <>
                                {cat.nombre_categoria}
                                <button onClick={() => { setCategoriaEditando(cat.id_categoria); setNombreEditado(cat.nombre_categoria) }}>Editar</button>
                                <button onClick={() => handleEliminar(cat.id_categoria)}>Eliminar</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Categorias