import api from './axiosConfig'

export const obtenerUsuarios = async () => {
    try {
        const response = await api.get('/usuarios/')
        return response.data
    } catch (error) {
        return []
    }
}

export const obtenerUsuario = async (id) => {
    const response = await api.get(`/usuarios/${id}`)
    return response.data
}

export const crearUsuario = async (data) => {
    const response = await api.post('/usuarios/', data)
    return response.data
}

export const editarUsuario = async (id, data) => {
    const response = await api.put(`/usuarios/${id}`, data)
    return response.data
}

export const eliminarUsuario = async (id) => {
    const response = await api.delete(`/usuarios/${id}`)
    return response.data
}