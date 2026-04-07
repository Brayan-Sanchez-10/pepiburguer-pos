import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Sidebar() {
    const { usuario, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <div>
            <h2>Pepiburguer POS</h2>

            <nav>
                {usuario?.rol === 'administrador' && (
                    <>
                        <Link to="/dashboard/categorias">Categorias</Link>
                        <Link to="/dashboard/productos">Productos</Link>
                        <Link to="/dashboard/mesas">Mesas</Link>
                        <Link to="/dashboard/usuarios">Usuarios</Link>
                        <Link to="/dashboard/turnos">Turnos</Link>
                    </>
                )}
                <Link to="/dashboard/pedidos">Pedidos</Link>
                <Link to="/dashboard/pagos">Pagos</Link>
            </nav>

            <div>
                <p>{usuario?.nombre}</p>
                <p>{usuario?.rol}</p>
                <button onClick={handleLogout}>Cerrar sesion</button>
            </div>
        </div>
    )
}

export default Sidebar