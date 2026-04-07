import { useState, useEffect } from "react"
import { obtenerUsuarios, crearUsuario, editarUsuario, eliminarUsuario } from "../api/usuarioApi"

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

    useEffect(() => {
        cargarUsuarios()
    }, [])

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
        await eliminarUsuario(id)
        cargarUsuarios()
    }

    return (
        <div>
            <h1>Usuarios</h1>

            <form onSubmit={handleCrear}>
                <label htmlFor="id_usuario">Cedula:</label>
                <input
                    type="text"
                    id="id_usuario"
                    value={idUsuario}
                    onChange={(e) => setIdUsuario(e.target.value)}
                    required
                />
                <label htmlFor="nombre_usuario">Nombre:</label>
                <input
                    type="text"
                    id="nombre_usuario"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
                <label htmlFor="celular_usuario">Celular:</label>
                <input
                    type="text"
                    id="celular_usuario"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    required
                />
                <label htmlFor="contrasena_usuario">Contraseña:</label>
                <input
                    type="password"
                    id="contrasena_usuario"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                />
                <label htmlFor="rol_usuario">Rol:</label>
                <select
                    id="rol_usuario"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                >
                    <option value="mesero">Mesero</option>
                    <option value="administrador">Administrador</option>
                </select>
                <button type="submit">Crear Usuario</button>
            </form>

            <ul>
                {usuarios.map((usu) => (
                    <li key={usu.id_usuario}>
                        {usuarioEditando === usu.id_usuario ? (
                            <>
                                <input
                                    value={nombreEditado}
                                    onChange={(e) => setNombreEditado(e.target.value)}
                                />
                                <input
                                    value={celularEditado}
                                    onChange={(e) => setCelularEditado(e.target.value)}
                                />
                                <select
                                    value={rolEditado}
                                    onChange={(e) => setRolEditado(e.target.value)}
                                >
                                    <option value="mesero">Mesero</option>
                                    <option value="administrador">Administrador</option>
                                </select>
                                <button onClick={() => handleEditar(usu.id_usuario)}>Guardar</button>
                                <button onClick={() => setUsuarioEditando(null)}>Cancelar</button>
                            </>
                        ) : (
                            <>
                                {usu.id_usuario} - {usu.nombre_usuario} - {usu.rol_usuario}
                                <button onClick={() => {
                                    setUsuarioEditando(usu.id_usuario)
                                    setNombreEditado(usu.nombre_usuario)
                                    setCelularEditado(usu.celular_usuario)
                                    setRolEditado(usu.rol_usuario)
                                }}>Editar</button>
                                <button onClick={() => handleEliminar(usu.id_usuario)}>Eliminar</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Usuarios