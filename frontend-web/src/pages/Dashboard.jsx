import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
    const { usuario, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div>
            <h1>Bienvenido {usuario?.nombre}</h1>
            <p>Rol: {usuario?.rol}</p>
            <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
    )
}

export default Dashboard