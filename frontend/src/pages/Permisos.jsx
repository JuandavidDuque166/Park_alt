import { useState, useEffect } from 'react';
import { permisosService } from '../services/permisosService';
import { RiKey2Line } from 'react-icons/ri';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import './Permisos.css';

export const Permisos = () => {
    const [permisos, setPermisos] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [permisoSeleccionado, setPermisoSeleccionado] = useState({
        id_permiso: null,
        nombre: '',
        descripcion: ''
    });

    useEffect(() => {
        cargarPermisos();
    }, []);

    const cargarPermisos = async () => {
        try {
            const data = await permisosService.obtenerPermisos();
            setPermisos(data);
        } catch (error) {
            console.error('Error al obtener permisos', error);
        }
    };

    const abrirModalCrear = () => {
        setPermisoSeleccionado({ id_permiso: null, nombre: '', descripcion: '' });
        setMostrarModal(true);
    };

    const abrirModalEditar = (permiso) => {
        setPermisoSeleccionado({ ...permiso });
        setMostrarModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!permisoSeleccionado.nombre) {
            alert('El nombre del permiso es obligatorio');
            return;
        }

        try {
            if (permisoSeleccionado.id_permiso) {
                await permisosService.actualizarPermiso(permisoSeleccionado.id_permiso, permisoSeleccionado);
                alert('Permiso actualizado');
            } else {
                await permisosService.agregarPermiso(permisoSeleccionado);
                alert('Permiso creado');
            }
            cargarPermisos();
            setMostrarModal(false);
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Error desconocido'));
        }
    };

    const eliminarPermiso = async (id) => {
        if (!window.confirm('¿Eliminar este permiso?')) return;

        try {
        await permisosService.eliminarPermiso(id);
        alert('Permiso eliminado');
        cargarPermisos();
    } catch (error) {
        alert('Error al eliminar');
    }
};

return (
    <div className="permisos-container">
        <div className="titulo-container">
            <h2><RiKey2Line /> Gestión de Permisos</h2>
            <button className="btn-add" onClick={abrirModalCrear}>Crear Permiso</button>
        </div>

        <div className="permisos-grid">
            {permisos.map(permiso => (
                <div key={permiso.id_permiso} className="permiso-card">
                    <h3>{permiso.nombre}</h3>
                    <p>{permiso.descripcion || 'Sin descripción'}</p>
                    <div className="acciones">
                        <button onClick={() => abrirModalEditar(permiso)}><FiEdit2 /></button>
                        <button onClick={() => eliminarPermiso(permiso.id_permiso)}><FiTrash2 /></button>
                    </div>
                </div>
            ))}
        </div>

        {mostrarModal && (
            <div className="modal-backdrop" onClick={() => setMostrarModal(false)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <h2>{permisoSeleccionado.id_permiso ? 'Editar' : 'Crear'} Permiso</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={permisoSeleccionado.nombre}
                            onChange={(e) => setPermisoSeleccionado({...permisoSeleccionado, nombre: e.target.value})}
                            placeholder="Nombre"
                            required
                        />
                        <textarea
                            value={permisoSeleccionado.descripcion}
                            onChange={(e) => setPermisoSeleccionado({...permisoSeleccionado, descripcion: e.target.value})}
                            placeholder="Descripción"
                            rows="3"
                        />
                        <button type="submit">Guardar</button>
                    </form>
                </div>
            </div>
        )}
    </div>
    );
};