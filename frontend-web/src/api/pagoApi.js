import api from './axiosConfig'

export const obtenerPagos = async () => {
    try {
        const response = await api.get('/pagos/')
        return response.data
    } catch (error) {
        return []
    }
}

export const obtenerPago = async (id) => {
    const response = await api.get(`/pagos/${id}`)
    return response.data
}

export const crearPago = async (data) => {
    const response = await api.post('/pagos/', data)
    return response.data
}

export const editarPago = async (id, data) => {
    const response = await api.put(`/pagos/${id}`, data)
    return response.data
}

export const eliminarPago = async (id) => {
    const response = await api.delete(`/pagos/${id}`)
    return response.data
}