import api from './axiosConfig'

export const obtenerCategorias = async () => {
    try {
        const response = await api.get('/categorias/')
        return response.data
    } catch (error) {
        return []
    }
}

export const obtenerCategoria = async(id) => {
    const response = await api.get(`/categorias/${id}`)
    return response.data
}

export const crearCategoria = async (data)=>{
    const response = await api.post('/categorias/', data)
    return response.data
}

export const editarCategoria = async (id, data)=>{
    const response = await api.put(`/categorias/${id}`, data)
    return response.data
}

export const eliminarCategoria = async (id) => {
    const response = await api.delete(`/categorias/${id}`)
    return response.data
}