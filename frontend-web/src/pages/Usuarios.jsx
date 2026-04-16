import { useState, useEffect } from "react"
import { obtenerUsuarios, crearUsuario, editarUsuario, eliminarUsuario } from "../api/usuarioApi"
import './Admin.css'

function Usuarios() {
    const [usuarios, setUsuarios] = useState([])
    const [idUsuario, setIdUsuario] = useState('')
    const [nombre, setNombre] = useState('')
    const [celular, setCelular] = useState('')
    const [contrasena, setContrasena] = useState('')
    const [rol, setRol] = useState('mesero')
    const [usuarioEditando, setUsuarioEditando] = useState(null)
    const [nombreEditado, setNombreEditado] = useState('')
    const [celularEditado, setCelularEditado] = useState('')
    const [rolEditado, setRolEditado] = useState('')

    useEffect(() => { cargarUsuarios() }, [])

    const cargarUsuarios = async () => {
        const data = await obtenerUsuarios()
        setUsuarios(data)
    }

    const handleCrear = async (e) => {
        e.preventDefault()
        await crearUsuario({
            id_usuario: idUsuario,
            nombre_usuario: nombre,
            celular_usuario: celular,
            contrasena_usuario: contrasena,
            rol_usuario: rol
        })
        setIdUsuario('')
        setNombre('')
        setCelular('')
        setContrasena('')
        setRol('mesero')
        cargarUsuarios()
    }

    const handleEditar = async (id) => {
        await editarUsuario(id, {
            nombre_usuario: nombreEditado,
            celular_usuario: celularEditado,
            rol_usuario: rolEditado
        })
        setUsuarioEditando(null)
        cargarUsuarios()
    }

    const handleEliminar = async (id) => {
        if (window.confirm('¿Eliminar este usuario?')) {
            await eliminarUsuario(id)
            cargarUsuarios()
        }
    }

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-title">
                    <span>👤</span>
                    <h1>Usuarios</h1>
                </div>
            </div>

            <div className="admin-layout">
                <div className="admin-form-card">
                    <h2>Nuevo Usuario</h2>
                    <form onSubmit={handleCrear}>
                        <div className="form-group">
                            <label>Cédula</label>
                            <input type="text" placeholder="Número de cédula" value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Nombre</label>
                            <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Celular</label>
                            <input type="text" placeholder="Número de celular" value={celular} onChange={(e) => setCelular(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Contraseña</label>
                            <input type="password" placeholder="Contraseña" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Rol</label>
                            <select value={rol} onChange={(e) => setRol(e.target.value)}>
                                <option value="mesero">Mesero</option>
                                <option value="administrador">Administrador</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary">+ Agregar Usuario</button>
                    </form>
                </div>

                <div className="admin-list-card">
                    <h2>Usuarios Registrados</h2>
                    <div className="admin-list">
                        {usuarios.map((usu) => (
                            <div key={usu.id_usuario} className="admin-item">
                                {usuarioEditando === usu.id_usuario ? (
                                    <div className="item-edit">
                                        <input value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} placeholder="Nombre" />
                                        <input value={celularEditado} onChange={(e) => setCelularEditado(e.target.value)} placeholder="Celular" style={{marginTop: '8px'}} />
                                        <select value={rolEditado} onChange={(e) => setRolEditado(e.target.value)} style={{marginTop: '8px'}}>
                                            <option value="mesero">Mesero</option>
                                            <option value="administrador">Administrador</option>
                                        </select>
                                        <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                                            <button className="btn-save" onClick={() => handleEditar(usu.id_usuario)}>✓ Guardar</button>
                                            <button className="btn-cancel" onClick={() => setUsuarioEditando(null)}>✕</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="usuario-avatar">
                                            {usu.nombre_usuario?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="item-info">
                                            <strong>{usu.nombre_usuario}</strong>
                                            <span>CC: {usu.id_usuario}</span>
                                            <span>{usu.celular_usuario}</span>
                                        </div>
                                        <div className="item-status">
                                            <span className={`badge-status ${usu.rol_usuario}`}>
                                                {usu.rol_usuario === 'administrador' ? '👑 Admin' : '🍽 Mesero'}
                                            </span>
                                        </div>
                                        <div className="item-acciones">
                                            <button className="btn-edit" onClick={() => {
                                                setUsuarioEditando(usu.id_usuario)
                                                setNombreEditado(usu.nombre_usuario)
                                                setCelularEditado(usu.celular_usuario)
                                                setRolEditado(usu.rol_usuario)
                                            }}>✏️ Editar</button>
                                            <button className="btn-delete" onClick={() => handleEliminar(usu.id_usuario)}>🗑 Eliminar</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {usuarios.length === 0 && <p className="empty-msg">No hay usuarios registrados</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Usuarios