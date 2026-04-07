import api from './axiosConfig'

export const obtenerProductos = async () => {
    try {
        const response = await api.get('/productos/')
        return response.data
    } catch (error) {
        return []
    }
}

export const obtenerProducto = async (id) => {
    const response = await api.get(`/productos/${id}`)
    return response.data
}

export const crearProducto = async (data) => {
    const response = await api.post('/productos/', data)
    return response.data
}

export const editarProducto = async (id, data) => {
    const response = await api.put(`/productos/${id}`, data)
    return response.data
}

export const eliminarProducto = async (id) => {
    const response = await api.delete(`/productos/${id}`)
    return response.data
}