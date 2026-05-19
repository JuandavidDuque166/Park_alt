import { useState, useEffect } from 'react';
import { usuariosService } from '../services/usuariosService';
import { FiUser, FiEdit2, FiSave, FiInfo } from 'react-icons/fi';
import { MdEmail, MdLock } from 'react-icons/md';
import { RiShieldLine } from 'react-icons/ri';
import './Perfil.css';

export const Perfil = () => {
    const [usuario, setUsuario] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);

    const [perfilForm, setPerfilForm] = useState({
        id_usuario: null,
        nombre: '',
        email: '',
        clave: '',
        confirmarClave: ''
    });

    useEffect(() => {
        cargarDatosUsuario();
    }, []);

    const cargarDatosUsuario = () => {
        const usuarioLocal = localStorage.getItem('usuario');
        if (usuarioLocal) {
            const user = JSON.parse(usuarioLocal);
            setUsuario(user);
        }
    };

    const abrirModalEditar = () => {
        if (!usuario) {
            alert('Error: No se pudo cargar los datos del usuario');
            return;
        }

        setPerfilForm({
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            email: usuario.email,
            clave: '',
            confirmarClave: ''
        });
        setMostrarCambioPassword(false);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setMostrarCambioPassword(false);
    };

    const toggleCambioPassword = () => {
        setMostrarCambioPassword(!mostrarCambioPassword);
        if (mostrarCambioPassword) {
            setPerfilForm({
                ...perfilForm,
                clave: '',
                confirmarClave: ''
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPerfilForm({
            ...perfilForm,
            [name]: value
        });
    };

    const actualizarPerfil = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!perfilForm.nombre || perfilForm.nombre.trim() === '') {
            alert('El nombre es obligatorio');
            return;
        }

        if (!perfilForm.email || perfilForm.email.trim() === '') {
            alert('El email es obligatorio');
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(perfilForm.email)) {
            alert('Formato de correo inválido');
            return;
        }

        // Si está cambiando contraseña, validar
        if (mostrarCambioPassword) {
            if (!perfilForm.clave || perfilForm.clave.length < 6) {
                alert('La contraseña debe tener al menos 6 caracteres');
                return;
            }

            if (perfilForm.clave !== perfilForm.confirmarClave) {
                alert('Las contraseñas no coinciden');
                return;
            }
        }

        // Preparar datos para enviar
        const datosActualizar = {
            nombre: perfilForm.nombre,
            email: perfilForm.email
        };

        // Solo incluir clave si se está cambiando
        if (mostrarCambioPassword && perfilForm.clave) {
            datosActualizar.clave = perfilForm.clave;
        }

        try {
            await usuariosService.actualizarUsuario(perfilForm.id_usuario, datosActualizar);
            alert('Perfil actualizado correctamente');

            // Actualizar datos locales
            const usuarioActualizado = {
                ...usuario,
                nombre: perfilForm.nombre,
                email: perfilForm.email
            };

            setUsuario(usuarioActualizado);

            // Actualizar localStorage
            localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));

            cerrarModal();
        } catch (error) {
            console.error('Error al actualizar perfil', error);
            const mensaje = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || 'Error desconocido';
            alert('Error al actualizar perfil: ' + mensaje);
        }
    };

return (
    <div className="perfil-container">
        <div className="perfil-header">
            <h2><FiUser /> Mi Perfil</h2>
        </div>

        {usuario && (
            <div className="perfil-card">
                <div className="perfil-avatar">
                    <div className="avatar-circle">
                        {usuario.nombre.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="perfil-info">
                    <h3>{usuario.nombre}</h3>
                    <p className="rol-badge">{usuario.rol_nombre || 'Sin rol asignado'}</p>

                    <div className="info-section">
                        <div className="info-item">
                            <MdEmail />
                            <div>
                                <label>Correo Electrónico</label>
                                <p>{usuario.email}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <RiShieldLine />
                            <div>
                                <label>Rol del Sistema</label>
                                <p>{usuario.rol_nombre}</p>
                            </div>
                        </div>
                    </div>

                    <button className="btn-edit" onClick={abrirModalEditar} type="button">
                        <FiEdit2 /> Editar Mi Perfil
                    </button>
                </div>
            </div>
        )}

        <div className="info-message">
            <FiInfo />
            <p>Desde aquí puedes actualizar tu información personal y cambiar tu contraseña.</p>
        </div>

        {/* Modal de Edición */}
        {mostrarModal && (
            <div className="modal-backdrop" onClick={cerrarModal}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2><FiEdit2 /> Editar Mi Perfil</h2>
                        <button className="btn-close" onClick={cerrarModal}>X</button>
                    </div>

                    <form onSubmit={actualizarPerfil} className="modal-form">
                        {/* Nombre */}
                        <div className="form-group">
                            <label>Nombre Completo *</label>
                            <input
                                type="text"
                                name="nombre"
                                value={perfilForm.nombre}
                                onChange={handleChange}
                                required
                                minLength="3"
                                placeholder="Ingresa tu nombre completo"
                            />
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label>Correo Electrónico *</label>
                            <input
                                type="email"
                                name="email"
                                value={perfilForm.email}
                                onChange={handleChange}
                                required
                                placeholder="correo@ejemplo.com"
                            />
                        </div>

                        {/* Botón para mostrar cambio de contraseña */}
                        <div className="password-toggle">
                            <button
                                type="button"
                                className="btn-link"
                                onClick={toggleCambioPassword}
                            >
                                <MdLock />
                                {mostrarCambioPassword ? 'Cancelar cambio de contraseña' : '¿Deseas cambiar tu contraseña?'}
                            </button>
                        </div>

                        {/* Campos de contraseña (solo si se activa) */}
                        {mostrarCambioPassword && (
                            <div className="password-section">
                                <div className="form-group">
                                    <label>Nueva Contraseña *</label>
                                    <input
                                        type="password"
                                        name="clave"
                                        value={perfilForm.clave}
                                        onChange={handleChange}
                                        required={mostrarCambioPassword}
                                        minLength="6"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Confirmar Nueva Contraseña *</label>
                                    <input
                                        type="password"
                                        name="confirmarClave"
                                        value={perfilForm.confirmarClave}
                                        onChange={handleChange}
                                        required={mostrarCambioPassword}
                                        placeholder="Repite la contraseña"
                                    />
                                    {perfilForm.clave !== perfilForm.confirmarClave && perfilForm.confirmarClave && (
                                        <small className="error-message">
                                            Las contraseñas no coinciden
                                        </small>
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={mostrarCambioPassword && perfilForm.clave !== perfilForm.confirmarClave}
                        >
                            <FiSave /> Guardar Cambios
                        </button>
                    </form>
                </div>
            </div>
        )}
        </div>
    );
};
