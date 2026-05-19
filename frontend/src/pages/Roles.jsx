import { useState, useEffect } from 'react';
import { rolesService } from '../services/rolesService';
import { permisosService } from '../services/permisosService';
import { RiShieldLine } from 'react-icons/ri';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import './Roles.css';

export const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [permisosDisponibles, setPermisosDisponibles] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [rolSeleccionado, setRolSeleccionado] = useState({
        id_rol: null,
        nombre: '',
        permisos: []
    });

    useEffect(() => {
        cargarRoles();
        cargarPermisos();
    }, []);

    const cargarRoles = async () => {
        try {
            const data = await rolesService.obtenerRoles();
            setRoles(data);
        } catch (error) {
            console.error('Error al obtener roles', error);
        }
    };

    const cargarPermisos = async () => {
        try {
            const data = await permisosService.obtenerPermisos();
            setPermisosDisponibles(data);
        } catch (error) {
            console.error('Error al obtener permisos', error);
        }
    };

    const abrirModalCrear = () => {
        setRolSeleccionado({
            id_rol: null,
            nombre: '',
            permisos: []
        });
        setMostrarModal(true);
    };

    const abrirModalEditar = async (rol) => {
        try {
            const data = await rolesService.obtenerRolPorId(rol.id_rol);
            setRolSeleccionado({
                id_rol: data.id_rol,
                nombre: data.nombre,
                permisos: data.permisos?.map(p => p.id_permiso || p.id) || []
            });
            setMostrarModal(true);
        } catch (error) {
            console.error('Error al cargar rol', error);
            alert('Error al cargar los datos del rol');
        }
    };

    const togglePermiso = (idPermiso) => {
        setRolSeleccionado({
            ...rolSeleccionado,
            permisos: rolSeleccionado.permisos.includes(idPermiso)
                ? rolSeleccionado.permisos.filter(id => id !== idPermiso)
                : [...rolSeleccionado.permisos, idPermiso]
        });
    };

    const seleccionarTodos = () => {
        setRolSeleccionado({
            ...rolSeleccionado,
            permisos: permisosDisponibles.map(p => p.id_permiso)
        });
    };

    const deseleccionarTodos = () => {
        setRolSeleccionado({
            ...rolSeleccionado,
            permisos: []
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rolSeleccionado.nombre || rolSeleccionado.nombre.trim().length < 3) {
            alert('El nombre del rol es obligatorio (mínimo 3 caracteres)');
            return;
        }

        if (rolSeleccionado.permisos.length === 0) {
            if (!window.confirm('¿Deseas crear el rol sin permisos?')) {
                return;
            }
        }

        try {
            if (rolSeleccionado.id_rol) {
                // Actualizar
                await rolesService.actualizarRol(rolSeleccionado.id_rol, { nombre: rolSeleccionado.nombre });
                await rolesService.asignarPermisos(rolSeleccionado.id_rol, rolSeleccionado.permisos);
                alert('Rol actualizado correctamente');
            } else {
                // Crear
                const nuevoRol = await rolesService.agregarRol({ nombre: rolSeleccionado.nombre });
                if (rolSeleccionado.permisos.length > 0) {
                    await rolesService.asignarPermisos(nuevoRol.id_rol, rolSeleccionado.permisos);
                }
                alert('Rol creado correctamente');
            }

            cargarRoles();
            setMostrarModal(false);
        } catch (error) {
            const mensaje = error.response?.data?.message || 'Error desconocido';
            alert('Error: ' + mensaje);
        }
    };

    const eliminarRol = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este rol?')) {
            return;
        }

        try {
            await rolesService.eliminarRol(id);
            alert('Rol eliminado correctamente');
            cargarRoles();
        } catch (error) {
            alert('Error al eliminar: ' + (error.response?.data?.message || 'Error desconocido'));
        }
    };

    return (
        <div className="roles-container">
            <div className="titulo-container">
                <h2><RiShieldLine /> Gestión de Roles</h2>
                <button className="btn-add" onClick={abrirModalCrear}>
                    Crear Rol
                </button>
            </div>

            <div className="roles-grid">
                {roles.map(rol => (
                    <div key={rol.id_rol} className="rol-card">
                        <div className="rol-header">
                            <h3>{rol.nombre}</h3>
                            <div className="rol-acciones">
                                <button className="btn-icon" onClick={() => abrirModalEditar(rol)}><FiEdit2 /></button>
                                <button className="btn-icon eliminar" onClick={() => eliminarRol(rol.id_rol)}><FiTrash2 /></button>
                            </div>
                        </div>
                        <div className="permisos-count">
                            {rol.permisos?.length || 0} permiso(s)
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {mostrarModal && (
                <div className="modal-backdrop" onClick={() => setMostrarModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{rolSeleccionado.id_rol ? 'Editar Rol' : 'Crear Nuevo Rol'}</h2>
                            <button className="btn-close" onClick={() => setMostrarModal(false)}>X</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Nombre del Rol *</label>
                                <input
                                    type="text"
                                    value={rolSeleccionado.nombre}
                                    onChange={(e) => setRolSeleccionado({...rolSeleccionado, nombre: e.target.value})}
                                    required
                                    minLength="3"
                                    placeholder="Ej: Editor, Moderador"
                                />
                            </div>

                            <div className="permisos-section">
                                <div className="permisos-header">
                                    <label>Permisos del Rol</label>
                                    <div>
                                        <button type="button" className="btn-link" onClick={seleccionarTodos}>
                                            Seleccionar todos
                                        </button>
                                        <button type="button" className="btn-link" onClick={deseleccionarTodos}>
                                            Limpiar
                                        </button>
                                    </div>
                                </div>

                                <div className="permisos-list">
                                    {permisosDisponibles.map(permiso => (
                                        <label key={permiso.id_permiso} className="permiso-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={rolSeleccionado.permisos.includes(permiso.id_permiso)}
                                                onChange={() => togglePermiso(permiso.id_permiso)}
                                            />
                                            <div>
                                                <strong>{permiso.nombre}</strong>
                                                {permiso.descripcion && <p>{permiso.descripcion}</p>}
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {rolSeleccionado.permisos.length > 0 && (
                                    <p className="permisos-contador">
                                        {rolSeleccionado.permisos.length} permiso(s) seleccionado(s)
                                    </p>
                                )}
                            </div>

                            <button type="submit" className="btn-submit">
                                {rolSeleccionado.id_rol ? 'Actualizar Rol' : 'Crear Rol'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};