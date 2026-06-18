import { useState, useEffect } from 'react';
import { usuariosService } from '../services/usuariosService';
import { rolesService } from '../services/rolesService';
import { FaPlus, FaEdit, FaUserSlash, FaUserCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Usuarios.css';

// --- COMPONENTE DE CONFIRMACIÓN ---
const ModalConfirmacion = ({ mostrar, mensaje, onConfirmar, onCancelar }) => {
  if (!mostrar) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-confirm">
        <h3>Confirmación</h3>
        <p>{mensaje}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancelar}>Cancelar</button>
          <button className="btn-confirm" onClick={onConfirmar}>Aceptar</button>
        </div>
      </div>
    </div>
  );
};

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [confirmarAction, setConfirmarAction] = useState({ mostrar: false, usuario: null });
  const [usuarioForm, setUsuarioForm] = useState({
    id_usuario: null, nombre: '', email: '', clave: '', id_rol: ''
  });

  const mostrarAlerta = (mensaje) => {
    const toastElement = document.getElementById('toast-alerta');
    if (toastElement) {
      toastElement.innerText = mensaje;
      toastElement.classList.add('toast-visible');
      setTimeout(() => toastElement.classList.remove('toast-visible'), 3000);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const data = await usuariosService.obtenerUsuarios();
      setUsuarios(data);
    } catch (e) { console.error('Error al cargar usuarios', e); }
  };

  const cargarRoles = async () => {
    try {
      const data = await rolesService.obtenerRoles();
      setRoles(Array.isArray(data) ? data : data?.data || []);
    } catch { setRoles([]); }
  };

  // Carga inicial de datos remotos al montar la vista.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarUsuarios();
    cargarRoles();
  }, []);

  const abrirModalEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioForm({ 
      id_usuario: usuario.id_usuario, 
      nombre: usuario.nombre, 
      email: usuario.email, 
      clave: '', 
      id_rol: usuario.id_rol 
    });
    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nombre = usuarioForm.nombre.trim();
    const email = usuarioForm.email.trim();
    const clave = usuarioForm.clave.trim();
    const idRol = Number(usuarioForm.id_rol);

    if (nombre.length < 3) {
      alert('Error: El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (!Number.isInteger(idRol) || idRol <= 0) {
      alert('Error: Selecciona un rol válido');
      return;
    }

    if (!modoEdicion && clave.length < 6) {
      alert('Error: La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (modoEdicion && clave && clave.length < 6) {
      alert('Error: La nueva clave debe tener al menos 6 caracteres');
      return;
    }

    const usuarioData = { 
      nombre, 
      email, 
      id_rol: idRol 
    };

    try {
      if (modoEdicion) {
        if (clave) usuarioData.clave = clave;
        await usuariosService.actualizarUsuario(usuarioForm.id_usuario, usuarioData);
      } else {
        usuarioData.clave = clave;
        await usuariosService.agregarUsuario(usuarioData);
      }
      mostrarAlerta("¡Guardado exitosamente!");
      cargarUsuarios();
      setMostrarModal(false);
    } catch (error) { 
      // El alert ahora mostrará el error específico del servidor
      const mensaje = error.response?.data?.message || 'Error al procesar el usuario';
      alert('Error: ' + mensaje); 
    }
  };

  const isActivo = (estado) => estado === true || estado === 1 || estado === '1' || estado === 'ACTIVO';

  const ejecutarCambioEstado = async () => {
    const { usuario } = confirmarAction;
    if (!usuario) return;
    
    const nuevoEstado = isActivo(usuario.estado) ? 'INACTIVO' : 'ACTIVO';
    try {
      await usuariosService.actualizarUsuario(usuario.id_usuario, { estado: nuevoEstado });
      await cargarUsuarios();
      mostrarAlerta(`Estado actualizado a ${nuevoEstado}`);
    } catch {
      toast.error("Error al actualizar estado");
    }
    setConfirmarAction({ mostrar: false, usuario: null });
  };

  return (
    <>
      <div className="card">
        <div className="header-actions">
          <h2>Gestión de Usuarios</h2>
          <button className="btn-add" onClick={() => { setModoEdicion(false); setUsuarioForm({ id_usuario: null, nombre: '', email: '', clave: '', id_rol: '' }); setMostrarModal(true); }}>
            <FaPlus /> Nuevo Usuario
          </button>
        </div>

        <div className="table-container">
          <table className="tabla-sistema">
            <thead>
              <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id_usuario}>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.rol}</td>
                  <td><span className={`badge ${isActivo(u.estado) ? 'activa' : 'inactiva'}`}>{isActivo(u.estado) ? 'ACTIVO' : 'INACTIVO'}</span></td>
                  <td className="actions">
                    <button className="edit-icon" type="button" onClick={() => abrirModalEditar(u)}>
                      <FaEdit />
                    </button>
                    {Number(u.id_rol) !== 1 && (
                      <button 
                        className={`edit-icon ${isActivo(u.estado) ? 'delete-icon' : 'activate-icon'}`} 
                        onClick={() => setConfirmarAction({ mostrar: true, usuario: u })}
                      >
                        {isActivo(u.estado) ? <FaUserSlash /> : <FaUserCheck />}
                      </button>
                    )}
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
              <input value={usuarioForm.nombre} onChange={(e) => setUsuarioForm({...usuarioForm, nombre: e.target.value})} placeholder="Nombre" required />
              <input value={usuarioForm.email} onChange={(e) => setUsuarioForm({...usuarioForm, email: e.target.value})} placeholder="Email" required />
              <input type="password" placeholder={modoEdicion ? "Nueva clave (opcional)" : "Contraseña"} onChange={(e) => setUsuarioForm({...usuarioForm, clave: e.target.value})} required={!modoEdicion} />
              <select value={usuarioForm.id_rol} onChange={(e) => setUsuarioForm({...usuarioForm, id_rol: e.target.value})} required>
                <option value="">Selecciona un rol</option>
                {roles.map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
              </select>
              <div className="modal-btns">
                <button type="submit" className="btn-comun btn-actualizar">Guardar</button>
                <button type="button" className="btn-comun btn-cancelar" onClick={() => setMostrarModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmarAction.usuario && (
        <ModalConfirmacion 
          mostrar={confirmarAction.mostrar}
          mensaje={`¿Deseas ${isActivo(confirmarAction.usuario.estado) ? 'desactivar' : 'activar'} a ${confirmarAction.usuario.nombre}?`}
          onConfirmar={ejecutarCambioEstado}
          onCancelar={() => setConfirmarAction({ mostrar: false, usuario: null })}
        />
      )}
      <div id="toast-alerta" className="toast-oculto">Operación realizada</div>
    </>
  );
};
export default Usuarios;
