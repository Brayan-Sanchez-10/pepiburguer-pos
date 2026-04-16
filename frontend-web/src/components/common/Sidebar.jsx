import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

function Sidebar() {
    const { usuario, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">🍔</div>
                <div className="sidebar-logo-text">
                    <h2>PepiBurguer</h2>
                    <span>Sistema POS</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/dashboard">
                    <span className="nav-icon">📊</span> Dashboard
                </NavLink>
                <NavLink to="/dashboard/pedidos">
                    <span className="nav-icon">📋</span> Pedidos
                </NavLink>
                {usuario?.rol === 'administrador' && (
                    <>
                        <NavLink to="/dashboard/mesas">
                            <span className="nav-icon">🪑</span> Mesas
                        </NavLink>
                        <NavLink to="/dashboard/productos">
                            <span className="nav-icon">🍔</span> Productos
                        </NavLink>
                        <NavLink to="/dashboard/categorias">
                            <span className="nav-icon">🗂</span> Categorías
                        </NavLink>
                        <NavLink to="/dashboard/turnos">
                            <span className="nav-icon">🕐</span> Turnos
                        </NavLink>
                        <NavLink to="/dashboard/usuarios">
                            <span className="nav-icon">👤</span> Usuarios
                        </NavLink>
                    </>
                )}
                <NavLink to="/dashboard/pagos">
                    <span className="nav-icon">💳</span> Pagos
                </NavLink>
            </nav>

            <div className="sidebar-user">
                <div className="sidebar-user-info">
                    <div className="sidebar-avatar">
                        {usuario?.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div className="sidebar-user-details">
                        <p>{usuario?.nombre}</p>
                        <span>{usuario?.rol}</span>
                    </div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    ↩ Cerrar Sesión
                </button>
            </div>
        </aside>
    )
}

export default Sidebar