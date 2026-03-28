import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosConfig'

function Login() {
    const [cedula, setCedula] = useState('')
    const [contrasena, setContrasena] = useState('')
    const [error, setError] = useState('')

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('username', cedula)
            formData.append('password', contrasena)

            const response = await api.post('/auth/login', formData)

            login(response.data.access_token, {
                nombre: response.data.nombre,
                rol: response.data.rol
            })

            navigate('/dashboard')

        } catch (error) {
            setError('Cedula o contraseña incorrectos')
        }
    }

    return (
        <div>
            <h1>PepiBurguer POS</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Cedula"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                />
                {error && <p>{error}</p>}
                <button type="submit">Iniciar sesión</button>
            </form>
        </div>
    )
}

export default Login


