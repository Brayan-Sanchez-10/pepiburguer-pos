import { useState, useEffect } from "react"
import { obtenerProductos, crearProducto, editarProducto, eliminarProducto } from "../api/productoApi"
import { obtenerCategorias } from "../api/categoriaApi"
import './Admin.css'

function Productos() {
    const [productos, setProductos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [idCategoria, setIdCategoria] = useState('')
    const [nombre, setNombre] = useState('')
    const [valor, setValor] = useState('')
    const [disponible, setDisponible] = useState(true)
    const [productoEditando, setProductoEditando] = useState(null)
    const [idCategoriaEditado, setIdCategoriaEditado] = useState('')
    const [nombreEditado, setNombreEditado] = useState('')
    const [valorEditado, setValorEditado] = useState('')
    const [disponibleEditado, setDisponibleEditado] = useState(true)

    useEffect(() => {
        cargarProductos()
        cargarCategorias()
    }, [])

    const cargarProductos = async () => {
        const data = await obtenerProductos()
        setProductos(data)
    }

    const cargarCategorias = async () => {
        const data = await obtenerCategorias()
        setCategorias(data)
    }

    const getNombreCategoria = (id) => {
        const cat = categorias.find(c => c.id_categoria === id)
        return cat ? cat.nombre_categoria : ''
    }

    const formatPesos = (valor) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor)

    const handleCrear = async (e) => {
        e.preventDefault()
        if (!idCategoria) { alert('Selecciona una categoría'); return }
        await crearProducto({
            id_categoria: parseInt(idCategoria),
            nombre_producto: nombre,
            valor_producto: parseFloat(valor),
            disponible
        })
        setIdCategoria('')
        setNombre('')
        setValor('')
        setDisponible(true)
        cargarProductos()
    }

    const handleEditar = async (id) => {
        await editarProducto(id, {
            id_categoria: parseInt(idCategoriaEditado),
            nombre_producto: nombreEditado,
            valor_producto: parseFloat(valorEditado),
            disponible: disponibleEditado
        })
        setProductoEditando(null)
        cargarProductos()
    }

    const handleEliminar = async (id) => {
        if (window.confirm('¿Eliminar este producto?')) {
            await eliminarProducto(id)
            cargarProductos()
        }
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-title">
                    <span>🍔</span>
                    <h1>Productos</h1>
                </div>
            </div>

            <div className="admin-layout">
                <div className="admin-form-card">
                    <h2>Nuevo Producto</h2>
                    <form onSubmit={handleCrear}>
                        <div className="form-group">
                            <label>Categoría</label>
                            <select value={idCategoria} onChange={(e) => setIdCategoria(e.target.value)} required>
                                <option value="">Selecciona una categoría</option>
                                {categorias.map(cat => (
                                    <option key={cat.id_categoria} value={cat.id_categoria}>
                                        {cat.nombre_categoria}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Nombre del Producto</label>
                            <input
                                type="text"
                                placeholder="Ej: Hamburguesa Clásica"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Valor</label>
                            <input
                                type="number"
                                placeholder="Ej: 15000"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group-check">
                            <input
                                type="checkbox"
                                id="disponible"
                                checked={disponible}
                                onChange={(e) => setDisponible(e.target.checked)}
                            />
                            <label htmlFor="disponible">Disponible en el menú</label>
                        </div>
                        <button type="submit" className="btn-primary">+ Agregar Producto</button>
                    </form>
                </div>

                <div className="admin-list-card">
                    <h2>Productos Registrados</h2>
                    <div className="admin-list">
                        {productos.map((pro) => (
                            <div key={pro.id_producto} className="admin-item">
                                {productoEditando === pro.id_producto ? (
                                    <div className="item-edit">
                                        <select value={idCategoriaEditado} onChange={(e) => setIdCategoriaEditado(e.target.value)}>
                                            {categorias.map(cat => (
                                                <option key={cat.id_categoria} value={cat.id_categoria}>
                                                    {cat.nombre_categoria}
                                                </option>
                                            ))}
                                        </select>
                                        <input value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} />
                                        <input type="number" value={valorEditado} onChange={(e) => setValorEditado(e.target.value)} />
                                        <div className="form-group-check">
                                            <input type="checkbox" checked={disponibleEditado} onChange={(e) => setDisponibleEditado(e.target.checked)} />
                                            <label>Disponible</label>
                                        </div>
                                        <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                                            <button className="btn-save" onClick={() => handleEditar(pro.id_producto)}>✓ Guardar</button>
                                            <button className="btn-cancel" onClick={() => setProductoEditando(null)}>✕</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="item-icon">🍔</div>
                                        <div className="item-info">
                                            <strong>{pro.nombre_producto}</strong>
                                            <span>{getNombreCategoria(pro.id_categoria)}</span>
                                            <span className="item-precio">{formatPesos(pro.valor_producto)}</span>
                                        </div>
                                        <div className="item-status">
                                            <span className={`badge-status ${pro.disponible ? 'activo' : 'inactivo'}`}>
                                                {pro.disponible ? 'Disponible' : 'No disponible'}
                                            </span>
                                        </div>
                                        <div className="item-acciones">
                                            <button className="btn-edit" onClick={() => {
                                                setProductoEditando(pro.id_producto)
                                                setIdCategoriaEditado(pro.id_categoria)
                                                setNombreEditado(pro.nombre_producto)
                                                setValorEditado(pro.valor_producto)
                                                setDisponibleEditado(pro.disponible)
                                            }}>✏️ Editar</button>
                                            <button className="btn-delete" onClick={() => handleEliminar(pro.id_producto)}>🗑 Eliminar</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {productos.length === 0 && <p className="empty-msg">No hay productos registrados</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Productos