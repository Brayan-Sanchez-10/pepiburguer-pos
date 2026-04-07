import api from './axiosConfig'

export const obtenerMesas = async () => {
    try {
        const response = await api.get('/mesas/')
        return response.data
    } catch (error) {
        return []
    }
}

export const obtenerMesa = async (id) => {
    const response = await api.get(`/mesas/${id}`)
    return response.data
}

export const crearMesa = async (data) => {
    const response = await api.post('/mesas/', data)
    return response.data
}

export const editarMesa = async (id, data) => {
    const response = await api.put(`/mesas/${id}`, data)
    return response.data
}

export const ocuparMesa = async (id, data) => {
    const response = await api.patch(`/mesas/${id}/ocupar`, data)
    return response.data
}

export const eliminarMesa = async (id) => {
    const response = await api.delete(`/mesas/${id}`)
    return response.data
}