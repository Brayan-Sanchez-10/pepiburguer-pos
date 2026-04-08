import api from './axiosConfig'

export const crearDomicilio = async (data) => {
    const response = await api.post('/domicilios/', data)
    return response.data
}