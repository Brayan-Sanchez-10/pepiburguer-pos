import api from './axiosConfig'

export const obtenerPedidos = async () => {
    try {
        const response = await api.get('/pedidos/')
        return response.data
    } catch (error) {
        return []
    }
}

export const obtenerPedido = async (id) => {
    const response = await api.get(`/pedidos/${id}`)
    return response.data
}

export const crearPedido = async (data) => {
    const response = await api.post('/pedidos/', data)
    return response.data
}

export const editarPedido = async (id, data) => {
    const response = await api.put(`/pedidos/${id}`, data)
    return response.data
}

export const eliminarPedido = async (id) => {
    const response = await api.delete(`/pedidos/${id}`)
    return response.data
}