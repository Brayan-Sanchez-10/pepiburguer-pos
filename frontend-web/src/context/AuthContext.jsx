import { createContext, useState, useContext } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(
        JSON.parse(localStorage.getItem('usuario')) || null
    )

    const login = (token, datosUsuario) => {
        localStorage.setItem('token', token)
        localStorage.setItem('usuario', JSON.stringify(datosUsuario))
        setUsuario(datosUsuario)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        setUsuario(null)
    }

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}