import { useState, useEffect } from "react"
import { obtenerPedidos, crearPedido } from "../api/pedidoApi"
import { crearPedidoProducto, obtenerPedidoProductos } from "../api/pedidoProductoApi"
import { obtenerMesas } from "../api/mesaApi"
import { obtenerProductos } from "../api/productoApi"
import { obtenerTurnos } from "../api/turnoApi"
import { crearDomicilio } from "../api/domicilioApi"
import { crearPago } from "../api/pagoApi"
import { obtenerCategorias } from "../api/categoriaApi"
import './Pedidos.css'

function Pedidos() {
    const [pedidos, setPedidos] = useState([])
    const [mesas, setMesas] = useState([])
    const [productos, setProductos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [pedidoProductos, setPedidoProductos] = useState([])
    const [idTurno, setIdTurno] = useState('')
    const [porCobrar, setPorCobrar] = useState([])
    const [modalPago, setModalPago] = useState(null)
    const [tipoPago, setTipoPago] = useState('efectivo')
    const [montoRecibido, setMontoRecibido] = useState('')
    const [mostrarFormulario, setMostrarFormulario] = useState(false)
    const [pagoRealizado, setPagoRealizado] = useState(null)
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
    const [productoActual, setProductoActual] = useState(null)
    const [notaActual, setNotaActual] = useState('')

    const [tipoPedido, setTipoPedido] = useState('mesa')
    const [idMesa, setIdMesa] = useState('')
    const [productosSeleccionados, setProductosSeleccionados] = useState([])
    const [nombreCliente, setNombreCliente] = useState('')
    const [direccionCliente, setDireccionCliente] = useState('')
    const [barrioCliente, setBarrioCliente] = useState('')
    const [celularCliente, setCelularCliente] = useState('')

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        const [pedidosData, mesasData, productosData, turnosData, pedidoProductosData, categoriasData] = await Promise.all([
            obtenerPedidos(),
            obtenerMesas(),
            obtenerProductos(),
            obtenerTurnos(),
            obtenerPedidoProductos(),
            obtenerCategorias()
        ])
        setPedidos(pedidosData)
        setMesas(mesasData)
        setProductos(productosData)
        setPedidoProductos(pedidoProductosData)
        setCategorias(categoriasData)
        const turnoActivo = turnosData.find(t => t.estado_turno === 'iniciado')
        if (turnoActivo) setIdTurno(turnoActivo.id_turno)
    }

    const getProductosPedido = (idPedido) =>
        pedidoProductos.filter(pp => pp.id_pedido === idPedido)

    const getNombreProducto = (idProducto) => {
        const p = productos.find(p => p.id_producto === idProducto)
        return p ? p.nombre_producto : ''
    }

    const getValorProducto = (idProducto) => {
        const p = productos.find(p => p.id_producto === idProducto)
        return p ? parseFloat(p.valor_producto) : 0
    }

    const getNombreMesa = (idMesa) => {
        const m = mesas.find(m => m.id_mesa === idMesa)
        return m ? `Mesa ${m.numero_mesa}` : 'Mesa'
    }

    const formatPesos = (valor) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor)

    const calcularCambio = () => {
        if (!modalPago || !montoRecibido) return 0
        if (tipoPago === 'transferencia') return 0
        return parseFloat(montoRecibido) - parseFloat(modalPago.valor_total)
    }

    const pedidosPendientes = pedidos.filter(p =>
        p.estado_pedido === 'no_cancelado' && !porCobrar.includes(p.id_pedido)
    )

    const pedidosPorCobrar = pedidos.filter(p =>
        p.estado_pedido === 'no_cancelado' && porCobrar.includes(p.id_pedido)
    )

    const pedidosCobrados = pedidos.filter(p => p.estado_pedido === 'cancelado')

    const handleMarcarPorCobrar = (id) => setPorCobrar([...porCobrar, id])

    const handleCobrarAhora = (pedido) => {
        setModalPago(pedido)
        setTipoPago('efectivo')
        setMontoRecibido('')
        setPagoRealizado(null)
    }

    const handleRegistrarPago = async (e) => {
        e.preventDefault()
        if (tipoPago === 'efectivo' && parseFloat(montoRecibido) < parseFloat(modalPago.valor_total)) {
            alert('El monto recibido es menor al total')
            return
        }
        try {
            const nuevoPago = await crearPago({
                id_pedido: modalPago.id_pedido,
                tipo_pago: tipoPago,
                monto_recibido: tipoPago === 'transferencia'
                    ? parseFloat(modalPago.valor_total)
                    : parseFloat(montoRecibido)
            })
            setPagoRealizado({ ...nuevoPago, pedido: modalPago })
            setPorCobrar(porCobrar.filter(id => id !== modalPago.id_pedido))
            cargarDatos()
        } catch (error) {
            alert('Error al registrar el pago')
        }
    }

    const handleImprimirRecibo = () => window.print()

    const handleCerrarModal = () => {
        setModalPago(null)
        setPagoRealizado(null)
        setMontoRecibido('')
    }

    const agregarProductoLista = () => {
        if (!productoActual) return
        const existe = productosSeleccionados.find(p => p.id_producto === productoActual.id_producto)
        if (existe) {
            setProductosSeleccionados(productosSeleccionados.map(p =>
                p.id_producto === productoActual.id_producto
                    ? { ...p, cantidad: p.cantidad + 1 }
                    : p
            ))
        } else {
            setProductosSeleccionados([...productosSeleccionados, {
                id_producto: productoActual.id_producto,
                nombre: productoActual.nombre_producto,
                valor: parseFloat(productoActual.valor_producto),
                cantidad: 1,
                nota_especial: notaActual || null
            }])
        }
        setProductoActual(null)
        setNotaActual('')
        setCategoriaSeleccionada(null)
    }

    const calcularTotal = () =>
        productosSeleccionados.reduce((total, p) => total + (p.valor * p.cantidad), 0)

    const handleCrearPedido = async (e) => {
        e.preventDefault()
        if (!idTurno) { alert('No hay turno activo'); return }
        if (productosSeleccionados.length === 0) { alert('Agrega al menos un producto'); return }
        if (tipoPedido === 'mesa' && !idMesa) { alert('Selecciona una mesa'); return }

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

        setMostrarFormulario(false)
        setTipoPedido('mesa')
        setIdMesa('')
        setProductosSeleccionados([])
        setCategoriaSeleccionada(null)
        setProductoActual(null)
        setNotaActual('')
        setNombreCliente('')
        setDireccionCliente('')
        setBarrioCliente('')
        setCelularCliente('')
        cargarDatos()
    }

    return (
        <div className="pedidos-page">

            <div className="pedidos-header">
                <div className="pedidos-title">
                    <span>📋</span>
                    <h1>Gestión de Pedidos</h1>
                </div>
                <button className="btn-nuevo-pedido" onClick={() => {
                    setMostrarFormulario(true)
                    setCategoriaSeleccionada(null)
                    setProductoActual(null)
                    setProductosSeleccionados([])
                }}>
                    + Nuevo Pedido
                </button>
            </div>

            <div className="pedidos-columnas">

                <div className="columna">
                    <div className="columna-header pendiente">
                        <span>🍳 En Preparación</span>
                        <span className="badge-count">{pedidosPendientes.length}</span>
                    </div>
                    <div className="columna-body">
                        {pedidosPendientes.map((pedido) => (
                            <div className="pedido-card" key={pedido.id_pedido}>
                                <div className="pedido-card-header">
                                    <div>
                                        <strong>#{String(pedido.id_pedido).padStart(3, '0')}</strong>
                                        <span className="pedido-tipo">
                                            {pedido.tipo_pedido === 'mesa' ? getNombreMesa(pedido.id_mesa) :
                                             pedido.tipo_pedido === 'domicilio' ? 'Domicilio' : 'Para Llevar'}
                                        </span>
                                    </div>
                                    <span className="pedido-subtipo">
                                        {pedido.tipo_pedido === 'mesa' ? 'Mesa' :
                                         pedido.tipo_pedido === 'domicilio' ? 'Domicilio' : 'Para llevar'}
                                    </span>
                                </div>
                                <div className="pedido-productos-lista">
                                    {getProductosPedido(pedido.id_pedido).map(pp => (
                                        <p key={pp.id_pe_pro}>
                                            {pp.cantidad}x {getNombreProducto(pp.id_producto)}
                                            {pp.nota_especial && <span className="nota"> — {pp.nota_especial}</span>}
                                        </p>
                                    ))}
                                </div>
                                <div className="pedido-card-footer">
                                    <span className="pedido-total-label">TOTAL: <strong>{formatPesos(pedido.valor_total)}</strong></span>
                                    <button className="btn-por-cobrar" onClick={() => handleMarcarPorCobrar(pedido.id_pedido)}>
                                        ✓ Marcar Listo
                                    </button>
                                </div>
                            </div>
                        ))}
                        {pedidosPendientes.length === 0 && <p className="empty-col">Sin pedidos</p>}
                    </div>
                </div>

                <div className="columna">
                    <div className="columna-header por-cobrar">
                        <span>💳 Por Cobrar</span>
                        <span className="badge-count">{pedidosPorCobrar.length}</span>
                    </div>
                    <div className="columna-body">
                        {pedidosPorCobrar.map((pedido) => (
                            <div className="pedido-card" key={pedido.id_pedido}>
                                <div className="pedido-card-header">
                                    <div>
                                        <strong>#{String(pedido.id_pedido).padStart(3, '0')}</strong>
                                        <span className="pedido-tipo">
                                            {pedido.tipo_pedido === 'mesa' ? getNombreMesa(pedido.id_mesa) :
                                             pedido.tipo_pedido === 'domicilio' ? 'Domicilio' : 'Para Llevar'}
                                        </span>
                                    </div>
                                    <span className="pedido-subtipo">{pedido.tipo_pedido}</span>
                                </div>
                                <div className="pedido-productos-lista">
                                    {getProductosPedido(pedido.id_pedido).map(pp => (
                                        <p key={pp.id_pe_pro}>
                                            {pp.cantidad}x {getNombreProducto(pp.id_producto)}
                                        </p>
                                    ))}
                                </div>
                                <div className="pedido-card-footer">
                                    <span className="pedido-total-label">TOTAL: <strong>{formatPesos(pedido.valor_total)}</strong></span>
                                    <button className="btn-cobrar-ahora" onClick={() => handleCobrarAhora(pedido)}>
                                        $ Cobrar Ahora
                                    </button>
                                </div>
                            </div>
                        ))}
                        {pedidosPorCobrar.length === 0 && <p className="empty-col">Sin pedidos</p>}
                    </div>
                </div>

                <div className="columna">
                    <div className="columna-header cobrado">
                        <span>✅ Cobrados</span>
                        <span className="badge-count">{pedidosCobrados.length}</span>
                    </div>
                    <div className="columna-body">
                        {pedidosCobrados.slice(0, 5).map((pedido) => (
                            <div className="pedido-card cobrado-card" key={pedido.id_pedido}>
                                <div className="pedido-card-header">
                                    <div>
                                        <strong>#{String(pedido.id_pedido).padStart(3, '0')}</strong>
                                        <span className="pedido-tipo">
                                            {pedido.tipo_pedido === 'mesa' ? getNombreMesa(pedido.id_mesa) :
                                             pedido.tipo_pedido === 'domicilio' ? 'Domicilio' : 'Para Llevar'}
                                        </span>
                                    </div>
                                    <span className="pedido-total-label">{formatPesos(pedido.valor_total)}</span>
                                </div>
                            </div>
                        ))}
                        {pedidosCobrados.length === 0 && <p className="empty-col">Sin pedidos</p>}
                    </div>
                </div>
            </div>

            {/* MODAL NUEVO PEDIDO */}
            {mostrarFormulario && (
                <div className="modal-overlay">
                    <div className="modal-formulario">
                        <div className="modal-header">
                            <h2>Nuevo Pedido</h2>
                            <button className="btn-cerrar-modal" onClick={() => setMostrarFormulario(false)}>✕</button>
                        </div>
                        <form onSubmit={handleCrearPedido}>

                            <div className="form-group">
                                <label>Tipo de Pedido</label>
                                <div className="tipo-pedido-btns">
                                    {['mesa', 'para_llevar', 'domicilio'].map(tipo => (
                                        <button key={tipo} type="button"
                                            className={`btn-tipo ${tipoPedido === tipo ? 'activo' : ''}`}
                                            onClick={() => setTipoPedido(tipo)}>
                                            {tipo === 'mesa' ? '🪑 Mesa' : tipo === 'para_llevar' ? '🥡 Para Llevar' : '🛵 Domicilio'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {tipoPedido === 'mesa' && (
                                <div className="form-group">
                                    <label>Mesa</label>
                                    <select value={idMesa} onChange={(e) => setIdMesa(e.target.value)} required>
                                        <option value="">Selecciona una mesa</option>
                                        {mesas.filter(m => m.estado === 'vacia').map(mesa => (
                                            <option key={mesa.id_mesa} value={mesa.id_mesa}>
                                                Mesa {mesa.numero_mesa}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {tipoPedido === 'domicilio' && (
                                <div className="form-group">
                                    <label>Datos del Cliente</label>
                                    <input placeholder="Nombre" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} required />
                                    <input placeholder="Dirección" value={direccionCliente} onChange={(e) => setDireccionCliente(e.target.value)} required style={{marginTop: '8px'}} />
                                    <input placeholder="Barrio" value={barrioCliente} onChange={(e) => setBarrioCliente(e.target.value)} style={{marginTop: '8px'}} />
                                    <input placeholder="Celular" value={celularCliente} onChange={(e) => setCelularCliente(e.target.value)} required style={{marginTop: '8px'}} />
                                </div>
                            )}

                            <div className="form-group">
                                <label>
                                    {productoActual ? (
                                        <span style={{cursor: 'pointer', color: '#FF6B00'}}
                                            onClick={() => { setProductoActual(null); setNotaActual('') }}>
                                            ← Volver a Productos
                                        </span>
                                    ) : categoriaSeleccionada ? (
                                        <span style={{cursor: 'pointer', color: '#FF6B00'}}
                                            onClick={() => { setCategoriaSeleccionada(null); setProductoActual(null) }}>
                                            ← Volver a Categorías
                                        </span>
                                    ) : 'Selecciona una Categoría'}
                                </label>

                                {!categoriaSeleccionada && (
                                    <div className="categorias-grid">
                                        {categorias.map(cat => (
                                            <button key={cat.id_categoria} type="button"
                                                className="btn-categoria"
                                                onClick={() => { setCategoriaSeleccionada(cat); setProductoActual(null) }}>
                                                🍽 {cat.nombre_categoria}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {categoriaSeleccionada && !productoActual && (
                                    <div className="productos-grid">
                                        {productos
                                            .filter(p => p.id_categoria === categoriaSeleccionada.id_categoria && p.disponible)
                                            .map(pro => (
                                                <button key={pro.id_producto} type="button"
                                                    className="btn-producto"
                                                    onClick={() => setProductoActual(pro)}>
                                                    <span className="prod-nombre">{pro.nombre_producto}</span>
                                                    <span className="prod-precio">{formatPesos(pro.valor_producto)}</span>
                                                </button>
                                            ))}
                                        {productos.filter(p => p.id_categoria === categoriaSeleccionada.id_categoria && p.disponible).length === 0 && (
                                            <p style={{color: '#888', fontSize: '0.85rem'}}>Sin productos disponibles</p>
                                        )}
                                    </div>
                                )}

                                {productoActual && (
                                    <div className="producto-seleccionado-confirm">
                                        <div className="prod-confirm-info">
                                            <strong>{productoActual.nombre_producto}</strong>
                                            <span>{formatPesos(productoActual.valor_producto)}</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Nota especial (opcional) ej: sin cebolla"
                                            value={notaActual}
                                            onChange={(e) => setNotaActual(e.target.value)}
                                            style={{width: '100%', marginTop: '10px'}}
                                        />
                                        <div className="prod-confirm-btns">
                                            <button type="button" className="btn-cancelar-prod"
                                                onClick={() => { setProductoActual(null); setNotaActual('') }}>
                                                ← Volver
                                            </button>
                                            <button type="button" className="btn-agregar-confirm"
                                                onClick={agregarProductoLista}>
                                                + Agregar al Pedido
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {productosSeleccionados.length > 0 && (
                                <div className="productos-seleccionados">
                                    {productosSeleccionados.map(p => (
                                        <div key={p.id_producto} className="prod-sel-item">
                                            <span>{p.cantidad}x {p.nombre}</span>
                                            <span>{formatPesos(p.valor * p.cantidad)}</span>
                                            <button type="button"
                                                onClick={() => setProductosSeleccionados(productosSeleccionados.filter(x => x.id_producto !== p.id_producto))}>
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <div className="total-pedido">
                                        Total: <strong>{formatPesos(calcularTotal())}</strong>
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="btn-crear-pedido">Crear Pedido</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL PAGO */}
            {modalPago && !pagoRealizado && (
                <div className="modal-overlay">
                    <div className="modal-pago">
                        <div className="modal-header">
                            <h2>Cobrar Pedido #{String(modalPago.id_pedido).padStart(3, '0')}</h2>
                            <button className="btn-cerrar-modal" onClick={handleCerrarModal}>✕</button>
                        </div>
                        <div className="pago-detalle">
                            <h3>Productos</h3>
                            {getProductosPedido(modalPago.id_pedido).map(pp => (
                                <div key={pp.id_pe_pro} className="pago-prod-item">
                                    <span>{pp.cantidad}x {getNombreProducto(pp.id_producto)}</span>
                                    <span>{formatPesos(getValorProducto(pp.id_producto) * pp.cantidad)}</span>
                                </div>
                            ))}
                            <div className="pago-total">
                                <span>TOTAL</span>
                                <strong>{formatPesos(modalPago.valor_total)}</strong>
                            </div>
                        </div>
                        <form onSubmit={handleRegistrarPago}>
                            <div className="form-group">
                                <label>Método de Pago</label>
                                <div className="tipo-pedido-btns">
                                    <button type="button" className={`btn-tipo ${tipoPago === 'efectivo' ? 'activo' : ''}`} onClick={() => setTipoPago('efectivo')}>💵 Efectivo</button>
                                    <button type="button" className={`btn-tipo ${tipoPago === 'transferencia' ? 'activo' : ''}`} onClick={() => setTipoPago('transferencia')}>📱 Transferencia</button>
                                </div>
                            </div>
                            {tipoPago === 'efectivo' && (
                                <div className="form-group">
                                    <label>Monto Recibido</label>
                                    <input type="number" value={montoRecibido} onChange={(e) => setMontoRecibido(e.target.value)} placeholder="$0" required />
                                    {montoRecibido && (
                                        <div className="cambio-display">
                                            Cambio: <strong>{formatPesos(calcularCambio())}</strong>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button type="submit" className="btn-cobrar-final">✓ Registrar Pago</button>
                        </form>
                    </div>
                </div>
            )}

            {/* RECIBO */}
            {pagoRealizado && (
                <div className="modal-overlay">
                    <div className="modal-recibo" id="recibo-print">
                        <div className="recibo-header">
                            <h2>🍔 PepiBurguer Restaurant</h2>
                            <p>Toda la Gloria sea para Dios</p>
                            <hr />
                        </div>
                        <p className="recibo-fecha">{new Date().toLocaleString('es-CO')}</p>
                        <p>Pedido #{String(pagoRealizado.pedido.id_pedido).padStart(3, '0')}</p>
                        <hr />
                        <div className="recibo-productos">
                            {getProductosPedido(pagoRealizado.pedido.id_pedido).map(pp => (
                                <div key={pp.id_pe_pro} className="recibo-item">
                                    <span>{pp.cantidad}x {getNombreProducto(pp.id_producto)}</span>
                                    <span>{formatPesos(getValorProducto(pp.id_producto) * pp.cantidad)}</span>
                                </div>
                            ))}
                        </div>
                        <hr />
                        <div className="recibo-totales">
                            <div><span>TOTAL</span><strong>{formatPesos(pagoRealizado.pedido.valor_total)}</strong></div>
                            <div><span>Tipo de pago</span><span>{pagoRealizado.tipo_pago}</span></div>
                            <div><span>Recibido</span><span>{formatPesos(pagoRealizado.monto_recibido)}</span></div>
                            <div><span>Cambio</span><strong>{formatPesos(pagoRealizado.cambio)}</strong></div>
                        </div>
                        <hr />
                        <p className="recibo-gracias">¡Gracias por su visita!</p>
                        <div className="recibo-btns">
                            <button className="btn-imprimir" onClick={handleImprimirRecibo}>🖨 Imprimir</button>
                            <button className="btn-cerrar-recibo" onClick={handleCerrarModal}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Pedidos