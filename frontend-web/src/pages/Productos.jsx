import { useState, useEffect } from "react"
import { obtenerProductos, crearProducto, editarProducto, eliminarProducto } from "../api/productoApi"
import { obtenerCategorias } from "../api/categoriaApi"

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

    const handleCrear = async (e) => {
        e.preventDefault()
        if (!idCategoria) {
        alert('Debes seleccionar una categoría antes de crear un producto')
        return
        }
        await crearProducto({
            id_categoria: parseInt(idCategoria),
            nombre_producto: nombre,
            valor_producto: parseFloat(valor),
            disponible: disponible
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
        await eliminarProducto(id)
        cargarProductos()
    }

    return (
        <div>
            <h1>Productos</h1>

            <form onSubmit={handleCrear}>
                <label htmlFor="id_categoria">Categoria:</label>
                <select
                    id="id_categoria"
                    value={idCategoria}
                    onChange={(e) => setIdCategoria(e.target.value)}
                    required
                >
                    <option value="">Selecciona una categoria</option>
                    {categorias.map((cat) => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>
                            {cat.id_categoria} - {cat.nombre_categoria}
                        </option>
                    ))}
                </select>

                <label htmlFor="nombre_producto">Nombre Producto:</label>
                <input
                    type="text"
                    id="nombre_producto"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />

                <label htmlFor="valor_producto">Valor del Producto:</label>
                <input
                    type="number"
                    id="valor_producto"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    required
                />

                <label htmlFor="disponible">Disponible:</label>
                <input
                    type="checkbox"
                    id="disponible"
                    checked={disponible}
                    onChange={(e) => setDisponible(e.target.checked)}
                />

                <button type="submit">Crear Producto</button>
            </form>

            <ul>
                {productos.map((pro) => (
                    <li key={pro.id_producto}>
                        {productoEditando === pro.id_producto ? (
                            <>
                                <select
                                    value={idCategoriaEditado}
                                    onChange={(e) => setIdCategoriaEditado(e.target.value)}
                                >
                                    {categorias.map((cat) => (
                                        <option key={cat.id_categoria} value={cat.id_categoria}>
                                            {cat.id_categoria} - {cat.nombre_categoria}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    value={nombreEditado}
                                    onChange={(e) => setNombreEditado(e.target.value)}
                                />
                                <input
                                    type="number"
                                    value={valorEditado}
                                    onChange={(e) => setValorEditado(e.target.value)}
                                />
                                <input
                                    type="checkbox"
                                    checked={disponibleEditado}
                                    onChange={(e) => setDisponibleEditado(e.target.checked)}
                                />
                                <button onClick={() => handleEditar(pro.id_producto)}>Guardar</button>
                                <button onClick={() => setProductoEditando(null)}>Cancelar</button>
                            </>
                        ) : (
                            <>
                                {pro.nombre_producto} - ${pro.valor_producto} - {pro.disponible ? 'Disponible' : 'No disponible'}
                                <button onClick={() => {
                                    setProductoEditando(pro.id_producto)
                                    setIdCategoriaEditado(pro.id_categoria)
                                    setNombreEditado(pro.nombre_producto)
                                    setValorEditado(pro.valor_producto)
                                    setDisponibleEditado(pro.disponible)
                                }}>Editar</button>
                                <button onClick={() => handleEliminar(pro.id_producto)}>Eliminar</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Productos