import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosConfig'
import './Login.css'

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
                rol: response.data.rol,
                cedula: response.data.id_usuario
            })
            navigate('/dashboard')
        } catch (error) {
            setError('Cédula o contraseña incorrectos')
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-title">
                    <h1>PepiBurguer</h1>
                    <p>Sistema POS — Inicia sesión para continuar</p>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Cédula</label>
                        <input
                            type="text"
                            placeholder="Ingresa tu cédula"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error-msg">{error}</div>}
                    <button type="submit" className="btn-login">
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login


