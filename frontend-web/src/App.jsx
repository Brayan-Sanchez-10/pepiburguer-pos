import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Categorias from './pages/Categorias'
import Productos from './pages/Productos'
import Mesas from './pages/Mesas'
import Usuarios from './pages/Usuarios'
import Turnos from './pages/Turnos'
import Pedidos from './pages/Pedidos'
import Pagos from './pages/Pagos'
import DashboardHome from './pages/DashboardHome'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="categorias" element={<Categorias />} />
              <Route path="productos" element={<Productos />} />
              <Route path="mesas" element={<Mesas/>} />
              <Route path="usuarios" element={<Usuarios/>} />
              <Route path="turnos" element={<Turnos/>} />
              <Route path="pedidos" element={<Pedidos/>} />
              <Route path="pagos" element={<Pagos/>} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
