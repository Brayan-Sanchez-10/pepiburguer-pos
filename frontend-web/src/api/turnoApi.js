import api from './axiosConfig'

export const obtenerTurnos = async () => {
    try {
        const response = await api.get('/turnos/')
        return response.data
    } catch (error) {
        return []
    }
}

export const obtenerTurno = async (id) => {
    const response = await api.get(`/turnos/${id}`)
    return response.data
}

export const crearTurno = async (data) => {
    const response = await api.post('/turnos/', data)
    return response.data
}

export const editarTurno = async (id, data) => {
    const response = await api.put(`/turnos/${id}`, data)
    return response.data
}

export const cerrarTurno = async (id) => {
    const response = await api.patch(`/turnos/${id}/cerrar`, {
        estado_turno: 'terminado'
    })
    return response.data
}

export const registrarEgreso = async (id, data) => {
    const response = await api.patch(`/turnos/${id}/egreso`, data)
    return response.data
}

export const eliminarTurno = async (id) => {
    const response = await api.delete(`/turnos/${id}`)
    return response.data
}