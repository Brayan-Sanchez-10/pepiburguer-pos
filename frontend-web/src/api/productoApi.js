import { data } from 'react-router-dom'
import api from './axiosConfig'

export const obtenerProductos = async () => {
    response = await api.get('/productos/')
    return response.data
}

export const obtenerProducto = async (id) =>{
    const response = await api.get(`/productos/${id}`)
    return response.data
}

export const crearProducto = async (data) => {
    const response = await api.post(`/productos/`, data)
    return response.data
}

export const editarProducto = async (id, data) =>{
    const response = await api.put(`/productos/${id}`, data)
    return response.data
}

export const elimarProducto = async (id) => {
    const response = await api.delete(`/productos/${id}`)
    return response.data
}