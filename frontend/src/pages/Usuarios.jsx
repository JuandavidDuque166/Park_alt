import { useState, useEffect } from 'react';
import { usuariosService } from '../services/usuariosService';
import { rolesService } from '../services/rolesService';
import { FiUsers, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { MdEmail } from 'react-icons/md';
import './Usuarios.css';

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioForm, setUsuarioForm] = useState({
    id_usuario: null,
    nombre: '',
    email: '',
    clave: '',
    id_rol: ''
  });

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await usuariosService.obtenerUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al obtener usuarios', error);
    }
  };

  const cargarRoles = async () => {
    try {
      const data = await rolesService.obtenerRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error al obtener roles', error);
    }
  };

  const cargarPermisos = async (idRol) => {
    if (!idRol) {
      setPermisos([]);
      return;
    }

    try {
      const rol = await rolesService.obtenerRolPorId(idRol);
      setPermisos(rol.permisos || []);
    } catch (error) {
      console.error('Error al cargar permisos', error);
      setPermisos([]);
    }
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setUsuarioForm({
      id_usuario: null,
      nombre: '',
      email: '',
      clave: '',
      id_rol: ''
    });
    setPermisos([]);
    setMostrarModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioForm({
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      email: usuario.email,
      clave: '',
      id_rol: usuario.id_rol || ''
    });

    if (usuario.id_rol) {
      cargarPermisos(usuario.id_rol);
    }

    setMostrarModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuarioForm({
      ...usuarioForm,
      [name]: value
    });

    if (name === 'id_rol') {
      cargarPermisos(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuarioForm.nombre || usuarioForm.nombre.trim().length < 3) {
      alert('El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (!usuarioForm.email) {
      alert('El email es obligatorio');
      return;
    }

    if (!modoEdicion && (!usuarioForm.clave || usuarioForm.clave.length < 6)) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (modoEdicion && usuarioForm.clave && usuarioForm.clave.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!usuarioForm.id_rol) {
      alert('Debe seleccionar un rol');
      return;
    }

    try {
      const usuarioData = {
        nombre: usuarioForm.nombre,
        email: usuarioForm.email,
        id_rol: Number(usuarioForm.id_rol)
      };

      if (modoEdicion) {
        if (usuarioForm.clave) {
          usuarioData.clave = usuarioForm.clave;
        }
        await usuariosService.actualizarUsuario(usuarioForm.id_usuario, usuarioData);
        alert('Usuario actualizado correctamente');
      } else {
        usuarioData.clave = usuarioForm.clave;
        await usuariosService.agregarUsuario(usuarioData);
        alert('Usuario creado correctamente');
      }

      cargarUsuarios();
      setMostrarModal(false);
    } catch (error) {
      const mensaje = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'Error desconocido';
      alert('Error: ' + mensaje);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) {
      return;
    }

    try {
      await usuariosService.eliminarUsuario(id);
      alert('Usuario eliminado correctamente');
      cargarUsuarios();
    } catch (error) {
      alert('Error al eliminar: ' + (error.response?.data?.message || 'Error desconocido'));
    }
  };

  return (
    <>
      <div className="usuarios-container">
        <div className="titulo-container">
          <h2><FiUsers /> Gestión de Usuarios</h2>
          <button className="btn-add" onClick={abrirModalCrear}>
            Crear Usuario
          </button>
        </div>

        <div className="usuarios-grid">
          {usuarios.map(usuario => (
            <div key={usuario.id_usuario} className="usuario-card">
              <div className="usuario-info">
                <h3>{usuario.nombre}</h3>
                <p><MdEmail /> {usuario.email}</p>
                <span className="rol-badge">{usuario.rol}</span>
              </div>
              <div className="usuario-acciones">
                <button className="btn-icon" onClick={() => abrirModalEditar(usuario)}>
                  <FiEdit2 />
                </button>
                <button className="btn-icon eliminar" onClick={() => eliminarUsuario(usuario.id_usuario)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {mostrarModal && (
        <div className="modal-backdrop" onClick={() => setMostrarModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoEdicion ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
              <button className="btn-close" onClick={() => setMostrarModal(false)}>x</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={usuarioForm.nombre}
                  onChange={handleChange}
                  required
                  minLength="3"
                  placeholder="Nombre del usuario"
                />
              </div>

              <div className="form-group">
                <label>Correo Electrónico *</label>
                <input
                  type="email"
                  name="email"
                  value={usuarioForm.email}
                  onChange={handleChange}
                  required
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="form-group">
                <label>Contraseña {modoEdicion ? '(opcional)' : '*'}</label>
                <input
                  type="password"
                  name="clave"
                  value={usuarioForm.clave}
                  onChange={handleChange}
                  required={!modoEdicion}
                  minLength="6"
                  placeholder={modoEdicion ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  name="id_rol"
                  value={usuarioForm.id_rol}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map(rol => (
                    <option key={rol.id_rol} value={rol.id_rol}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {permisos.length > 0 && (
                <div className="permisos-info">
                  <h4>Permisos del Rol:</h4>
                  <div className="permisos-list">
                    {permisos.map((permiso, index) => (
                      <span key={index} className="permiso-chip">
                        {permiso.nombre || permiso}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="btn-submit">
                {modoEdicion ? 'Actualizar Usuario' : 'Crear Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Usuarios;
