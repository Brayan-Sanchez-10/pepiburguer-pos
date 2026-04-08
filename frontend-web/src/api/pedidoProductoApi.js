import api from './axiosConfig'

export const obtenerPedidoProductos = async () => {
    try {
        const response = await api.get('/pedidos_productos/')
        return response.data
    } catch (error) {
        return []
    }
}

export const crearPedidoProducto = async (data) => {
    const response = await api.post('/pedidos_productos/', data)
    return response.data
}

export const editarPedidoProducto = async (id, data) => {
    const response = await api.put(`/pedidos_productos/${id}`, data)
    return response.data
}

export const eliminarPedidoProducto = async (id) => {
    const response = await api.delete(`/pedidos_productos/${id}`)
    return response.data
}