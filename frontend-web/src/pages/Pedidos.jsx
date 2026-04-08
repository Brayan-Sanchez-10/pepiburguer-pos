import { useState, useEffect } from "react"
import { obtenerPedidos, crearPedido, editarPedido, eliminarPedido } from "../api/pedidoApi"
import { crearPedidoProducto, eliminarPedidoProducto, obtenerPedidoProductos } from "../api/pedidoProductoApi"
import { obtenerMesas } from "../api/mesaApi"
import { obtenerProductos } from "../api/productoApi"
import { obtenerTurnos } from "../api/turnoApi"
import { crearDomicilio } from "../api/domicilioApi"

function Pedidos() {
    const [pedidos, setPedidos] = useState([])
    const [mesas, setMesas] = useState([])
    const [productos, setProductos] = useState([])
    const [pedidoProductos, setPedidoProductos] = useState([])
    const [idTurno, setIdTurno] = useState('')

    // Estados del formulario nuevo pedido
    const [tipoPedido, setTipoPedido] = useState('mesa')
    const [idMesa, setIdMesa] = useState('')
    const [productosSeleccionados, setProductosSeleccionados] = useState([])
    const [idProductoActual, setIdProductoActual] = useState('')
    const [cantidadActual, setCantidadActual] = useState(1)
    const [notaActual, setNotaActual] = useState('')

    // Estados domicilio
    const [nombreCliente, setNombreCliente] = useState('')
    const [direccionCliente, setDireccionCliente] = useState('')
    const [barrioCliente, setBarrioCliente] = useState('')
    const [celularCliente, setCelularCliente] = useState('')

    // Estado pedido seleccionado para agregar productos después
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
    const [idProductoExtra, setIdProductoExtra] = useState('')
    const [cantidadExtra, setCantidadExtra] = useState(1)
    const [notaExtra, setNotaExtra] = useState('')

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        const [pedidosData, mesasData, productosData, turnosData, pedidoProductosData] = await Promise.all([
            obtenerPedidos(),
            obtenerMesas(),
            obtenerProductos(),
            obtenerTurnos(),
            obtenerPedidoProductos()
        ])
        setPedidos(pedidosData)
        setMesas(mesasData)
        setProductos(productosData)
        setPedidoProductos(pedidoProductosData)
        const turnoActivo = turnosData.find(t => t.estado_turno === 'iniciado')
        if (turnoActivo) setIdTurno(turnoActivo.id_turno)
    }

    const agregarProductoLista = () => {
        if (!idProductoActual) {
            alert('Selecciona un producto')
            return
        }
        const producto = productos.find(p => p.id_producto === parseInt(idProductoActual))
        const existe = productosSeleccionados.find(p => p.id_producto === parseInt(idProductoActual))
        if (existe) {
            setProductosSeleccionados(productosSeleccionados.map(p =>
                p.id_producto === parseInt(idProductoActual)
                    ? { ...p, cantidad: p.cantidad + parseInt(cantidadActual) }
                    : p
            ))
        } else {
            setProductosSeleccionados([...productosSeleccionados, {
                id_producto: parseInt(idProductoActual),
                nombre: producto.nombre_producto,
                valor: producto.valor_producto,
                cantidad: parseInt(cantidadActual),
                nota_especial: notaActual || null
            }])
        }
        setIdProductoActual('')
        setCantidadActual(1)
        setNotaActual('')
    }

    const quitarProductoLista = (idProducto) => {
        setProductosSeleccionados(productosSeleccionados.filter(p => p.id_producto !== idProducto))
    }

    const calcularTotal = () => {
        return productosSeleccionados.reduce((total, p) => total + (p.valor * p.cantidad), 0)
    }

    const handleCrearPedido = async (e) => {
        e.preventDefault()

        if (!idTurno) {
            alert('No hay turno activo. Por favor abre un turno primero.')
            return
        }

        if (productosSeleccionados.length === 0) {
            alert('Debes agregar al menos un producto al pedido')
            return
        }

        if (tipoPedido === 'mesa' && !idMesa) {
            alert('Debes seleccionar una mesa')
            return
        }

        if (tipoPedido === 'domicilio' && (!nombreCliente || !direccionCliente || !celularCliente)) {
            alert('Debes completar los datos del domicilio')
            return
        }

        const nuevoPedido = await crearPedido({
            valor_total: calcularTotal(),
            id_turno: idTurno,
            id_mesa: tipoPedido === 'mesa' ? parseInt(idMesa) : null,
            tipo_pedido: tipoPedido,
            estado_pedido: 'no_cancelado'
        })

        for (const prod of productosSeleccionados) {
            await crearPedidoProducto({
                id_pedido: nuevoPedido.id_pedido,
                id_producto: prod.id_producto,
                cantidad: prod.cantidad,
                nota_especial: prod.nota_especial
            })
        }

        if (tipoPedido === 'domicilio') {
            await crearDomicilio({
                nombre_cliente: nombreCliente,
                direccion_cliente: direccionCliente,
                barrio_cliente: barrioCliente,
                celular_cliente: celularCliente,
                id_pedido: nuevoPedido.id_pedido
            })
        }

        setTipoPedido('mesa')
        setIdMesa('')
        setProductosSeleccionados([])
        setNombreCliente('')
        setDireccionCliente('')
        setBarrioCliente('')
        setCelularCliente('')

        cargarDatos()
        alert(`Pedido #${nuevoPedido.id_pedido} creado exitosamente`)
    }

    const handleAgregarProductoExtra = async (e) => {
        e.preventDefault()
        await crearPedidoProducto({
            id_pedido: pedidoSeleccionado.id_pedido,
            id_producto: parseInt(idProductoExtra),
            cantidad: parseInt(cantidadExtra),
            nota_especial: notaExtra || null
        })
        setIdProductoExtra('')
        setCantidadExtra(1)
        setNotaExtra('')
        cargarDatos()
    }

    const handleCancelarPedido = async (id) => {
        if (window.confirm('¿Estás seguro de cancelar este pedido?')) {
            await editarPedido(id, { estado_pedido: 'cancelado' })
            cargarDatos()
        }
    }

    const handleEliminarProducto = async (id) => {
        await eliminarPedidoProducto(id)
        cargarDatos()
    }

    const getProductosPedido = (idPedido) => {
        return pedidoProductos.filter(pp => pp.id_pedido === idPedido)
    }

    const getNombreProducto = (idProducto) => {
        const producto = productos.find(p => p.id_producto === idProducto)
        return producto ? producto.nombre_producto : ''
    }

    const getNombreMesa = (idMesa) => {
        const mesa = mesas.find(m => m.id_mesa === idMesa)
        return mesa ? `Mesa ${mesa.numero_mesa}` : ''
    }

    return (
        <div>
            <h1>Pedidos</h1>

            {/* FORMULARIO NUEVO PEDIDO */}
            <h2>Nuevo Pedido</h2>
            <form onSubmit={handleCrearPedido}>

                {/* PASO 1 - Tipo de pedido */}
                <div>
                    <label>Tipo de Pedido:</label>
                    <select value={tipoPedido} onChange={(e) => setTipoPedido(e.target.value)}>
                        <option value="mesa">Mesa</option>
                        <option value="para_llevar">Para Llevar</option>
                        <option value="domicilio">Domicilio</option>
                    </select>
                </div>

                {/* PASO 2 - Mesa si aplica */}
                {tipoPedido === 'mesa' && (
                    <div>
                        <label>Mesa:</label>
                        <select value={idMesa} onChange={(e) => setIdMesa(e.target.value)} required>
                            <option value="">Selecciona una mesa</option>
                            {mesas.filter(m => m.estado === 'vacia').map((mesa) => (
                                <option key={mesa.id_mesa} value={mesa.id_mesa}>
                                    Mesa {mesa.numero_mesa}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* PASO 2 - Datos domicilio si aplica */}
                {tipoPedido === 'domicilio' && (
                    <div>
                        <input placeholder="Nombre cliente" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} required />
                        <input placeholder="Dirección" value={direccionCliente} onChange={(e) => setDireccionCliente(e.target.value)} required />
                        <input placeholder="Barrio" value={barrioCliente} onChange={(e) => setBarrioCliente(e.target.value)} />
                        <input placeholder="Celular" value={celularCliente} onChange={(e) => setCelularCliente(e.target.value)} required />
                    </div>
                )}

                {/* PASO 3 - Agregar productos */}
                <div>
                    <label>Agregar Producto:</label>
                    <select value={idProductoActual} onChange={(e) => setIdProductoActual(e.target.value)}>
                        <option value="">Selecciona un producto</option>
                        {productos.filter(p => p.disponible).map((pro) => (
                            <option key={pro.id_producto} value={pro.id_producto}>
                                {pro.nombre_producto} - ${pro.valor_producto}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={cantidadActual}
                        min="1"
                        onChange={(e) => setCantidadActual(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Nota especial"
                        value={notaActual}
                        onChange={(e) => setNotaActual(e.target.value)}
                    />
                    <button type="button" onClick={agregarProductoLista}>Agregar</button>
                </div>

                {/* Lista de productos seleccionados */}
                {productosSeleccionados.length > 0 && (
                    <div>
                        <h3>Productos del pedido:</h3>
                        <ul>
                            {productosSeleccionados.map((p) => (
                                <li key={p.id_producto}>
                                    {p.nombre} x{p.cantidad} - ${p.valor * p.cantidad}
                                    {p.nota_especial && ` - Nota: ${p.nota_especial}`}
                                    <button type="button" onClick={() => quitarProductoLista(p.id_producto)}>Quitar</button>
                                </li>
                            ))}
                        </ul>
                        <strong>Total: ${calcularTotal()}</strong>
                    </div>
                )}

                <button type="submit">Crear Pedido</button>
            </form>

            {/* PEDIDOS ACTIVOS */}
            <h2>Pedidos Activos</h2>
            <ul>
                {pedidos.filter(p => p.estado_pedido === 'no_cancelado').map((pedido) => (
                    <li key={pedido.id_pedido}>
                        <strong>Pedido #{pedido.id_pedido}</strong> —
                        {pedido.tipo_pedido} —
                        {pedido.id_mesa && getNombreMesa(pedido.id_mesa)} —
                        Total: ${pedido.valor_total}

                        <button onClick={() => setPedidoSeleccionado(
                            pedidoSeleccionado?.id_pedido === pedido.id_pedido ? null : pedido
                        )}>
                            {pedidoSeleccionado?.id_pedido === pedido.id_pedido ? 'Cerrar' : 'Agregar Productos'}
                        </button>
                        <button onClick={() => handleCancelarPedido(pedido.id_pedido)}>Cancelar</button>

                        {/* Productos del pedido */}
                        <ul>
                            {getProductosPedido(pedido.id_pedido).map((pp) => (
                                <li key={pp.id_pe_pro}>
                                    {getNombreProducto(pp.id_producto)} x{pp.cantidad}
                                    {pp.nota_especial && ` - Nota: ${pp.nota_especial}`}
                                    <button onClick={() => handleEliminarProducto(pp.id_pe_pro)}>Quitar</button>
                                </li>
                            ))}
                        </ul>

                        {/* Formulario agregar productos extra */}
                        {pedidoSeleccionado?.id_pedido === pedido.id_pedido && (
                            <form onSubmit={handleAgregarProductoExtra}>
                                <select value={idProductoExtra} onChange={(e) => setIdProductoExtra(e.target.value)} required>
                                    <option value="">Selecciona un producto</option>
                                    {productos.filter(p => p.disponible).map((pro) => (
                                        <option key={pro.id_producto} value={pro.id_producto}>
                                            {pro.nombre_producto} - ${pro.valor_producto}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={cantidadExtra}
                                    min="1"
                                    onChange={(e) => setCantidadExtra(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Nota especial"
                                    value={notaExtra}
                                    onChange={(e) => setNotaExtra(e.target.value)}
                                />
                                <button type="submit">Agregar</button>
                            </form>
                        )}
                    </li>
                ))}
            </ul>

            {/* PEDIDOS CANCELADOS */}
            <h2>Pedidos Cancelados</h2>
            <ul>
                {pedidos.filter(p => p.estado_pedido === 'cancelado').map((pedido) => (
                    <li key={pedido.id_pedido}>
                        Pedido #{pedido.id_pedido} — {pedido.tipo_pedido} — Total: ${pedido.valor_total}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Pedidos