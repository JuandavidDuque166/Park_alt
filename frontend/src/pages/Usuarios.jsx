import { useState, useEffect } from 'react';
import { usuariosService } from '../services/usuariosService';
import { rolesService } from '../services/rolesService';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import './Usuarios.css';

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioForm, setUsuarioForm] = useState({
    id_usuario: null, nombre: '', email: '', clave: '', id_rol: ''
  });

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const mostrarAlerta = (mensaje) => {
    const toast = document.getElementById('toast-alerta');
    toast.innerText = mensaje;
    toast.classList.add('toast-visible');
    setTimeout(() => toast.classList.remove('toast-visible'), 3000);
  };

  const cargarUsuarios = async () => {
    try {
      const data = await usuariosService.obtenerUsuarios();
      setUsuarios(data);
    } catch (error) { console.error('Error al cargar usuarios', error); }
  };

  const cargarRoles = async () => {
    try {
      const data = await rolesService.obtenerRoles();
      setRoles(Array.isArray(data) ? data : data?.data || []);
    } catch (error) { setRoles([]); }
  };

  const cargarPermisos = async (idRol) => {
    if (!idRol) { setPermisos([]); return; }
    try {
      const rol = await rolesService.obtenerRolPorId(idRol);
      setPermisos(rol.permisos || []);
    } catch (error) { setPermisos([]); }
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setUsuarioForm({ id_usuario: null, nombre: '', email: '', clave: '', id_rol: '' });
    setPermisos([]);
    setMostrarModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioForm({ id_usuario: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email, clave: '', id_rol: usuario.id_rol });
    if (usuario.id_rol) cargarPermisos(usuario.id_rol);
    setMostrarModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuarioForm({ ...usuarioForm, [name]: value });
    if (name === 'id_rol') cargarPermisos(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const usuarioData = { nombre: usuarioForm.nombre, email: usuarioForm.email, id_rol: Number(usuarioForm.id_rol) };
      if (modoEdicion) {
        if (usuarioForm.clave) usuarioData.clave = usuarioForm.clave;
        await usuariosService.actualizarUsuario(usuarioForm.id_usuario, usuarioData);
      } else {
        usuarioData.clave = usuarioForm.clave;
        await usuariosService.agregarUsuario(usuarioData);
      }
      mostrarAlerta("¡Guardado exitosamente!");
      cargarUsuarios();
      setMostrarModal(false);
    } catch (error) { alert('Error: ' + (error.response?.data?.message || 'Error desconocido')); }
  };

  const isActivo = (estado) => {
    return estado === true || estado === 1 || estado === '1' || estado === 'ACTIVO';
  };

  const cambiarEstadoUsuario = async (usuario) => {
    const activo = isActivo(usuario.estado);
    const nuevoEstado = activo ? 'INACTIVO' : 'ACTIVO';
    if (!window.confirm(`¿Deseas ${activo ? 'desactivar' : 'activar'} al usuario ${usuario.nombre}?`)) return;
    try {
      await usuariosService.actualizarUsuario(usuario.id_usuario, { estado: nuevoEstado });
      await cargarUsuarios();
      mostrarAlerta(`Estado actualizado a ${nuevoEstado}`);
    } catch (error) {
      const mensajeError = error.response?.data?.message || error.message || 'Error desconocido al actualizar el usuario';
      alert(`Error al cambiar el estado: ${mensajeError}`);
    }
  };

  return (
    <>
      <div className="card">
        <div className="header-actions">
          <h2>Gestión de Usuarios</h2>
          <button className="btn-add" onClick={abrirModalCrear}>+ Nuevo Usuario</button>
        </div>

        <div className="table-container">
          <table className="tabla-sistema">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
  {usuarios.map(u => (
    <tr key={u.id_usuario}>
      <td>{u.nombre}</td>
      <td>{u.email}</td>
      <td>{u.rol}</td>
      <td>
        <span className={`badge ${isActivo(u.estado) ? 'activa' : 'inactiva'}`}>
          {isActivo(u.estado) ? 'ACTIVO' : 'INACTIVO'}
        </span>
      </td>
      <td>{new Date(u.fecha_creacion).toLocaleDateString()}</td>
      <td className="actions">
        <button onClick={() => abrirModalEditar(u)} title="Editar">
          <FiEdit2 />
        </button>
        <button
          type="button"
          className={isActivo(u.estado) ? 'delete' : ''}
          onClick={() => cambiarEstadoUsuario(u)}
          title={isActivo(u.estado) ? 'Desactivar usuario' : 'Activar usuario'}
        >
          {isActivo(u.estado) ? 'Desactivar' : 'Activar'}
        </button>
      </td>
    </tr>
  ))}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{modoEdicion ? 'Editar' : 'Crear'} Usuario</h2>
            <form onSubmit={handleSubmit}>
              <input name="nombre" value={usuarioForm.nombre} onChange={handleChange} placeholder="Nombre" required />
              <input name="email" value={usuarioForm.email} onChange={handleChange} placeholder="Email" required />
              <select name="id_rol" value={usuarioForm.id_rol} onChange={handleChange} required>
                <option value="">Selecciona rol</option>
                {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
              </select>
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => setMostrarModal(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
      <div id="toast-alerta" className="toast-oculto">Operación realizada</div>
    </>
  );
};

export default Usuarios;