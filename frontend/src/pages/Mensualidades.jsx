import { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaEdit } from 'react-icons/fa';
import { FiEye, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import './Mensualidades.css';



const camposIniciales = {
    id: null,
    placa: '',
    tipo: '',
    nivel_servicio: '',
    propietario: '',
    telefono: '',
    vigencia: '',
    fecha_fin: '',
    valor: ''
};

const obtenerUsuarioActual = () => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) return null;

    try {
        return JSON.parse(usuarioGuardado);
    } catch {
        return { rol: usuarioGuardado };
    }
};

const formatearFechaInput = (fecha) => {
    if (!fecha) return '';
    if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const sumarDias = (fecha, dias) => {
    const date = new Date(fecha);
    date.setDate(date.getDate() + dias);
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split('T')[0];
};

const normalizarMensualidad = (mensualidad) => ({
    ...mensualidad,
    vigencia: formatearFechaInput(mensualidad.vigencia || mensualidad.fecha_inicio),
    fecha_fin: formatearFechaInput(mensualidad.fecha_fin),
    valor: mensualidad.valor ?? ''
});

const formatearMoneda = (valor) => {
    const numero = Number(valor);
    return Number.isFinite(numero) ? `$${numero.toLocaleString('es-CO')}` : '$0';
};

const normalizarTextoRol = (valor) => String(valor || '').trim().toUpperCase();

const obtenerRolUsuario = (usuario) => {
    const idRol = Number(usuario?.id_rol ?? usuario?.rol);
    const nombreRol = normalizarTextoRol(
        usuario?.rol_nombre ?? usuario?.nombre_rol ?? usuario?.nombreRol ?? usuario?.role ?? usuario?.rol
    );

    return { idRol, nombreRol };
};

const Mensualidades = () => {
    const [mensualidades, setMensualidades] = useState([]);
    const [tarifas, setTarifas] = useState([]);
    const [tarifasError, setTarifasError] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formData, setFormData] = useState(camposIniciales);
    const [mensualidadDetalle, setMensualidadDetalle] = useState(null);

    const usuario = useMemo(() => obtenerUsuarioActual(), []);
    const { idRol, nombreRol } = useMemo(() => obtenerRolUsuario(usuario), [usuario]);
    const puedeAdministrarMensualidades = idRol === 1 || nombreRol === 'ADMINISTRADOR';
    const regexPropietario = /^[\p{L}\s]+$/u;
    const propietarioValido = !formData.propietario || regexPropietario.test(formData.propietario);

    const mostrarAlerta = (mensaje) => {
        const toastElement = document.getElementById('toast-alerta');
        if (toastElement) {
            toastElement.innerText = mensaje;
            toastElement.classList.add('toast-visible');
            setTimeout(() => toastElement.classList.remove('toast-visible'), 3000);
        }
    };

    const cargarMensualidades = async () => {
        try {
            const res = await api.get('/mensualidades');
            setMensualidades(res.data);
        } catch {
            toast.error('Error cargando mensualidades');
        }
    };

    useEffect(() => {
        let activo = true;

        const cargarDatosIniciales = async () => {
            const resultados = await Promise.allSettled([
                api.get('/mensualidades'),
                api.get('/tarifas')
            ]);

            if (!activo) return;

            const [mensualidadesResult, tarifasResult] = resultados;

            if (mensualidadesResult.status === 'fulfilled') {
                setMensualidades(mensualidadesResult.value.data);
            } else {
                toast.error('Error cargando mensualidades');
            }

            if (tarifasResult.status === 'fulfilled') {
                setTarifas(tarifasResult.value.data);
                setTarifasError(false);
            } else {
                console.error('Error cargando tarifas:', tarifasResult.reason);
                toast.error('No se pudieron cargar las tarifas.');
                setTarifasError(true);
            }
        };

        cargarDatosIniciales();

        return () => {
            activo = false;
        };
    }, []);

    const abrirNuevoModal = () => {
        if (!puedeAdministrarMensualidades) return;

        const hoyStr = new Date().toISOString().split('T')[0];
        setModoEdicion(false);
        setFormData({
            ...camposIniciales,
            vigencia: hoyStr,
            fecha_fin: sumarDias(hoyStr, 30)
        });
        setModalAbierto(true);
    };

    const abrirEditarModal = (mensualidad) => {
        if (!puedeAdministrarMensualidades) return;

        setModoEdicion(true);
        setFormData(normalizarMensualidad(mensualidad));
        setModalAbierto(true);
    };

    const abrirModalDetalles = (item) => {
        setMensualidadDetalle(normalizarMensualidad(item));
        setModalDetallesAbierto(true);
    };

    const cerrarModalDetalles = () => {
        setModalDetallesAbierto(false);
        setMensualidadDetalle(null);
    };

    const handlePropietarioChange = (e) => {
        const value = e.target.value;
        if (value === '' || regexPropietario.test(value)) {
            setFormData((prev) => ({ ...prev, propietario: value }));
        }
    };

    const handleTipoVehiculoChange = (e) => {
        const tipoSeleccionado = e.target.value;
        setFormData((prev) => ({ ...prev, tipo: tipoSeleccionado }));

        if (!tarifas?.length || !tipoSeleccionado) return;

        const tarifaEncontrada = tarifas.find(
            (tarifa) => tarifa.tipo?.toUpperCase() === tipoSeleccionado.toUpperCase()
        );

        if (tarifaEncontrada) {
            const valorMensual = tarifaEncontrada.valor_mensual ?? tarifaEncontrada.valor ?? tarifaEncontrada.valor_dia ?? 0;
            setFormData((prev) => ({
                ...prev,
                tipo: tipoSeleccionado,
                valor: valorMensual > 0 ? String(valorMensual) : ''
            }));
        }
    };

    const guardarMensualidad = async (e) => {
        e.preventDefault();

        if (!puedeAdministrarMensualidades) {
            toast.error('No tienes permisos para guardar mensualidades');
            return;
        }

        if (!propietarioValido || !formData.propietario?.trim()) {
            toast.error('El propietario solo puede contener letras y espacios');
            return;
        }

        const payload = {
            placa: formData.placa?.trim().toUpperCase(),
            tipo: formData.tipo?.trim().toUpperCase(),
            nivel_servicio: formData.nivel_servicio?.trim().toUpperCase(),
            propietario: formData.propietario?.trim(),
            telefono: formData.telefono,
            fecha_inicio: formData.vigencia,
            fecha_fin: formData.fecha_fin,
            valor: formData.valor
        };

        try {
            if (modoEdicion) {
                await api.put(`/mensualidades/${formData.id}`, payload);
                mostrarAlerta('Mensualidad actualizada correctamente');
            } else {
                await api.post('/mensualidades', payload);
                mostrarAlerta('Mensualidad creada correctamente');
            }

            setModalAbierto(false);
            cargarMensualidades();
        } catch {
            toast.error('Error al guardar la mensualidad');
        }
    };

    const eliminar = async (id) => {
        if (!puedeAdministrarMensualidades) {
            toast.error('No tienes permisos para eliminar mensualidades');
            return;
        }

        if (!window.confirm('Seguro que deseas eliminar esta mensualidad?')) return;

        try {
            await api.delete(`/mensualidades/${id}`);
            cargarMensualidades();
            mostrarAlerta('Eliminado correctamente');
        } catch {
            toast.error('No se pudo eliminar');
        }
    };

    return (
        <div className="mensualidades-page">
            <section className="mensualidades-card">
                <div className="mensualidades-header">
                    <h2>Gestion de Mensualidades</h2>
                    {puedeAdministrarMensualidades && (
                        <button className="btn-add" type="button" onClick={abrirNuevoModal}>
                            <FaPlus /> Nueva Mensualidad
                        </button>
                    )}
                </div>

                <div className="table-container">
                    <table className="mensualidades-table">
                        <thead>
                            <tr>
                                <th>Placa</th>
                                <th>Tipo</th>
                                <th>Servicio</th>
                                <th>Propietario</th>
                                <th>Telefono</th>
                                <th>Vigencia</th>
                                <th>Valor</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mensualidades.length > 0 ? (
                                mensualidades.map((mensualidad) => (
                                    <tr key={mensualidad.id}>
                                        <td>{mensualidad.placa}</td>
                                        <td>{mensualidad.tipo}</td>
                                        <td>{mensualidad.nivel_servicio}</td>
                                        <td>{mensualidad.propietario}</td>
                                        <td>{mensualidad.telefono}</td>
                                        <td>
                                            {formatearFechaInput(mensualidad.vigencia || mensualidad.fecha_inicio)} -{' '}
                                            {formatearFechaInput(mensualidad.fecha_fin)}
                                        </td>
                                        <td>{formatearMoneda(mensualidad.valor)}</td>
                                        <td>
                                            <div className="mensualidades-actions">
                                                {!puedeAdministrarMensualidades ? (
                                                    <button
                                                        className="btn-icon btn-view"
                                                        type="button"
                                                        aria-label="Ver detalles"
                                                        onClick={() => abrirModalDetalles(mensualidad)}
                                                    >
                                                        <FiEye />
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button className="edit-icon" type="button" onClick={() => abrirEditarModal(mensualidad)}>
    <FaEdit />
</button>
                                                        <button
                                                            className="btn-icon btn-delete"
                                                            type="button"
                                                            aria-label="Eliminar mensualidad"
                                                            onClick={() => eliminar(mensualidad.id)}
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="empty-state" colSpan="8">
                                        No hay mensualidades registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {modalAbierto && (
                <div className="modal-backdrop" role="presentation">
                    <div className="modal mensualidades-modal" role="dialog" aria-modal="true">
                        <div className="modal-header">
                            <h3>{modoEdicion ? 'Editar' : 'Nueva'} Mensualidad</h3>
                        </div>

                        <form onSubmit={guardarMensualidad}>
                            <label>Placa *</label>
                            <input
                                value={formData.placa}
                                onChange={(e) => setFormData((prev) => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                                required
                                maxLength={6}
                            />

                            <label>Tipo de Vehiculo *</label>
                            <select value={formData.tipo} onChange={handleTipoVehiculoChange} required>
                                <option value="">Seleccione...</option>
                                {tarifas.map((tarifa) => (
                                    <option key={tarifa.id_tipo} value={tarifa.tipo}>
                                        {tarifa.tipo}
                                    </option>
                                ))}
                            </select>

                            <label>Nivel de Servicio *</label>
                            <select
                                value={formData.nivel_servicio}
                                onChange={(e) => setFormData((prev) => ({ ...prev, nivel_servicio: e.target.value }))}
                                required
                            >
                                <option value="">Seleccione...</option>
                                <option value="ALTURA">Altura</option>
                                <option value="SUBTERRANEO">Subterraneo</option>
                            </select>

                            <label>Propietario *</label>
                            <input value={formData.propietario} onChange={handlePropietarioChange} disabled={modoEdicion} required />

                            <label>Telefono *</label>
                            <input
                                type="tel"
                                value={formData.telefono}
                                onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value.replace(/\D/g, '') }))}
                                required
                                maxLength={10}
                            />

                            <div className="fecha-row">
                                <div className="fecha-col">
                                    <label>Inicio *</label>
                                    <input
                                        type="date"
                                        className="fecha-input"
                                        value={formData.vigencia}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                vigencia: e.target.value,
                                                fecha_fin: sumarDias(e.target.value, 30)
                                            }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="fecha-col">
                                    <label>Fin *</label>
                                    <input
                                        type="date"
                                        className="fecha-input"
                                        value={formData.fecha_fin}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, fecha_fin: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            <label>Valor ($) *</label>
                            <input
                                type="number"
                                value={formData.valor}
                                onChange={(e) => setFormData((prev) => ({ ...prev, valor: e.target.value }))}
                                readOnly={!tarifasError}
                                required
                            />

                            <div className="modal-btns">
                                <button type="submit" className="btn-comun btn-actualizar">
                                    {modoEdicion ? 'Actualizar' : 'Guardar'}
                                </button>
                                <button type="button" className="btn-comun btn-cancelar" onClick={() => setModalAbierto(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalDetallesAbierto && mensualidadDetalle && (
                <div className="modal-backdrop" role="presentation">
                    <div className="modal mensualidades-modal" role="dialog" aria-modal="true">
                        <div className="modal-header">
                            <h3>Detalles de Mensualidad</h3>
                        </div>

                        <div className="details-grid">
                            <label>
                                Placa
                                <input className="readonly-input" value={mensualidadDetalle.placa || ''} readOnly />
                            </label>
                            <label>
                                Tipo de Vehiculo
                                <input className="readonly-input" value={mensualidadDetalle.tipo || ''} readOnly />
                            </label>
                            <label>
                                Nivel de Servicio
                                <input className="readonly-input" value={mensualidadDetalle.nivel_servicio || ''} readOnly />
                            </label>
                            <label>
                                Propietario
                                <input className="readonly-input" value={mensualidadDetalle.propietario || ''} readOnly />
                            </label>
                            <label>
                                Telefono
                                <input className="readonly-input" value={mensualidadDetalle.telefono || ''} readOnly />
                            </label>
                            <label>
                                Fecha Inicio
                                <input className="readonly-input" value={mensualidadDetalle.vigencia || ''} readOnly />
                            </label>
                            <label>
                                Fecha Fin
                                <input className="readonly-input" value={mensualidadDetalle.fecha_fin || ''} readOnly />
                            </label>
                            <label>
                                Valor Pagado
                                <input className="readonly-input" value={formatearMoneda(mensualidadDetalle.valor)} readOnly />
                            </label>
                        </div>

                        <div className="modal-btns">
                            <button type="button" className="btn-comun btn-cancelar" onClick={cerrarModalDetalles}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div id="toast-alerta" className="toast-oculto">
                Operacion realizada
            </div>
        </div>
    );
};

export default Mensualidades;
