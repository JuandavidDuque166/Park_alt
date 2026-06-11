import { useState, useEffect } from 'react';
import { usuariosService } from '../services/usuariosService';
import { rolesService } from '../services/rolesService';
import { FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Usuarios.css';

// --- COMPONENTE DE CONFIRMACIÓN PERSONALIZADO ---
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
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  
  // Estado para el modal personalizado
  const [confirmarAction, setConfirmarAction] = useState({ mostrar: false, usuario: null });

  const [usuarioForm, setUsuarioForm] = useState({
    id_usuario: null, nombre: '', email: '', clave: '', id_rol: ''
  });

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

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
    } catch (error) { console.error('Error al cargar usuarios', error); }
  };

  const cargarRoles = async () => {
    try {
      const data = await rolesService.obtenerRoles();
      setRoles(Array.isArray(data) ? data : data?.data || []);
    } catch (error) { setRoles([]); }
  };

  const abrirModalEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioForm({ id_usuario: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email, clave: '', id_rol: usuario.id_rol });
    setMostrarModal(true);
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

  const isActivo = (estado) => estado === true || estado === 1 || estado === '1' || estado === 'ACTIVO';

  const ejecutarCambioEstado = async () => {
    const { usuario } = confirmarAction;
    if (!usuario) return;
    
    const nuevoEstado = isActivo(usuario.estado) ? 'INACTIVO' : 'ACTIVO';
    try {
      await usuariosService.actualizarUsuario(usuario.id_usuario, { estado: nuevoEstado });
      await cargarUsuarios();
      mostrarAlerta(`Estado actualizado a ${nuevoEstado}`);
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
    setConfirmarAction({ mostrar: false, usuario: null });
  };

  return (
    <>
      <div className="card">
        <div className="header-actions">
          <h2>Gestión de Usuarios</h2>
          <button className="btn-add" onClick={() => { setModoEdicion(false); setUsuarioForm({ id_usuario: null, nombre: '', email: '', clave: '', id_rol: '' }); setMostrarModal(true); }}>+ Nuevo Usuario</button>
        </div>

        <div className="table-container">
          <table className="tabla-sistema">
            <thead>
              <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id_usuario}>
                  <td>{u.nombre}</td><td>{u.email}</td><td>{u.rol}</td>
                  <td><span className={`badge ${isActivo(u.estado) ? 'activa' : 'inactiva'}`}>{isActivo(u.estado) ? 'ACTIVO' : 'INACTIVO'}</span></td>
                  <td className="actions">
                    <button onClick={() => abrirModalEditar(u)}><FiEdit2 /></button>
                    {Number(u.id_rol) !== 1 && (
                      <button className={isActivo(u.estado) ? 'delete' : ''} onClick={() => setConfirmarAction({ mostrar: true, usuario: u })}>
                        {isActivo(u.estado) ? 'Desactivar' : 'Activar'}
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
              <input name="nombre" value={usuarioForm.nombre} onChange={(e) => setUsuarioForm({...usuarioForm, nombre: e.target.value})} placeholder="Nombre completo" required />
              <input name="email" value={usuarioForm.email} onChange={(e) => setUsuarioForm({...usuarioForm, email: e.target.value})} placeholder="Email" required />
              <input name="clave" type="password" placeholder={modoEdicion ? "Nueva contraseña (vacío para mantener)" : "Contraseña"} required={!modoEdicion} onChange={(e) => setUsuarioForm({...usuarioForm, clave: e.target.value})} />
              <select name="id_rol" value={usuarioForm.id_rol} onChange={(e) => setUsuarioForm({...usuarioForm, id_rol: e.target.value})} required>
                <option value="">Selecciona un rol</option>
                {roles.map(r => (
                  <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                ))}
              </select>
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => setMostrarModal(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN CUSTOM - CORREGIDO */}
      {confirmarAction.usuario && (
        <ModalConfirmacion 
          mostrar={confirmarAction.mostrar}
          mensaje={`¿Deseas ${isActivo(confirmarAction.usuario.estado) ? 'desactivar' : 'activar'} al usuario ${confirmarAction.usuario.nombre}?`}
          onConfirmar={ejecutarCambioEstado}
          onCancelar={() => setConfirmarAction({ mostrar: false, usuario: null })}
        />
      )}

      <div id="toast-alerta" className="toast-oculto">Operación realizada</div>
    </>
  );
};

export default Usuarios;