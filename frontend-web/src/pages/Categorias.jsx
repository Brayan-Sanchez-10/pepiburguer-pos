import { useState, useEffect } from "react"
import { obtenerCategorias, crearCategoria, editarCategoria, eliminarCategoria } from "../api/categoriaApi"
import './Admin.css'

function Categorias() {
    const [categorias, setCategorias] = useState([])
    const [nombre, setNombre] = useState('')
    const [categoriaEditando, setCategoriaEditando] = useState(null)
    const [nombreEditado, setNombreEditado] = useState('')

    useEffect(() => { cargarCategorias() }, [])

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

    const handleEditar = async (id) => {
        await editarCategoria(id, { nombre_categoria: nombreEditado })
        setCategoriaEditando(null)
        cargarCategorias()
    }

    const handleEliminar = async (id) => {
        if (window.confirm('¿Eliminar esta categoría?')) {
            await eliminarCategoria(id)
            cargarCategorias()
        }
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-title">
                    <span>🗂</span>
                    <h1>Categorías</h1>
                </div>
            </div>

            <div className="admin-layout">
                <div className="admin-form-card">
                    <h2>Nueva Categoría</h2>
                    <form onSubmit={handleCrear}>
                        <div className="form-group">
                            <label>Nombre</label>
                            <input
                                type="text"
                                placeholder="Ej: Hamburguesas"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary">+ Agregar Categoría</button>
                    </form>
                </div>

                <div className="admin-list-card">
                    <h2>Categorías Registradas</h2>
                    <div className="admin-list">
                        {categorias.map((cat) => (
                            <div key={cat.id_categoria} className="admin-item">
                                {categoriaEditando === cat.id_categoria ? (
                                    <div className="item-edit">
                                        <input
                                            value={nombreEditado}
                                            onChange={(e) => setNombreEditado(e.target.value)}
                                        />
                                        <button className="btn-save" onClick={() => handleEditar(cat.id_categoria)}>✓ Guardar</button>
                                        <button className="btn-cancel" onClick={() => setCategoriaEditando(null)}>✕</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="item-icon">🍽</div>
                                        <div className="item-info">
                                            <strong>{cat.nombre_categoria}</strong>
                                        </div>
                                        <div className="item-acciones">
                                            <button className="btn-edit" onClick={() => {
                                                setCategoriaEditando(cat.id_categoria)
                                                setNombreEditado(cat.nombre_categoria)
                                            }}>✏️ Editar</button>
                                            <button className="btn-delete" onClick={() => handleEliminar(cat.id_categoria)}>🗑 Eliminar</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {categorias.length === 0 && <p className="empty-msg">No hay categorías registradas</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Categorias