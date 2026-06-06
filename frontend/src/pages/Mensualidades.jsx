import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import './Mensualidades.css';

const Mensualidades = () => {
    const [mensualidades, setMensualidades] = useState([]);
    const [tarifas, setTarifas] = useState([]);
    const [tarifasError, setTarifasError] = useState(false);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [formData, setFormData] = useState({ id: null, placa: '', tipo: '', nivel_servicio: '', propietario: '', telefono: '', vigencia: '', fecha_fin: '', valor: '' });
    const [mensualidadDetalle, setMensualidadDetalle] = useState(null);
    const usuario = JSON.parse(localStorage.getItem('usuario')); // O como lo llames en tu app
    const esOperario = usuario?.rol === 'OPERARIO';
    const regexPropietario = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
    const propietarioValido = !formData.propietario || regexPropietario.test(formData.propietario);

        const mostrarAlerta = (mensaje) => {
        const toast = document.getElementById('toast-alerta');
        toast.innerText = mensaje;
        toast.classList.add('toast-visible');
        setTimeout(() => toast.classList.remove('toast-visible'), 3000);
    };

    const formatearFechaInput = (fecha) => {
        if (!fecha) return '';
        if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return fecha;
        }
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
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
    };
    const cargarMensualidades = async () => {
        try {
            const res = await api.get('/mensualidades');
            setMensualidades(res.data);
        } catch (err) {
            toast.error("Error cargando mensualidades");
        }
    };
    const cargarTarifas = async () => {
        try {
            const res = await api.get('/tarifas');
            setTarifas(res.data);
            setTarifasError(false);
        } catch (err) {
            console.error('Error cargando tarifas:', err);
            toast.error("No se pudieron cargar las tarifas. Los valores se completarán manualmente.");
            setTarifasError(true);
        }
    };
    useEffect(() => {
        cargarMensualidades();
        cargarTarifas();
    }, []);
    const abrirNuevoModal = () => {
        const hoy = new Date();
        const hoyStr = hoy.toISOString().split('T')[0];
        setModoEdicion(false);
        setFormData({
            id: null,
            placa: '',
            tipo: '',
            nivel_servicio: '',
            propietario: '',
            telefono: '',
            vigencia: hoyStr,
            fecha_fin: sumarDias(hoyStr, 30),
            valor: ''
        });
        setModalAbierto(true);
    };
    const abrirEditarModal = (mensualidad) => {
        setModoEdicion(true);
        setFormData({
            ...mensualidad,
            vigencia: formatearFechaInput(mensualidad.vigencia || mensualidad.fecha_inicio),
            fecha_fin: formatearFechaInput(mensualidad.fecha_fin),
            valor: mensualidad.valor ?? ''
        });
        setModalAbierto(true);
    };
    const abrirModalDetalles = (mensualidad) => {
        setMensualidadDetalle({
            ...mensualidad,
            vigencia: formatearFechaInput(mensualidad.vigencia || mensualidad.fecha_inicio),
            fecha_fin: formatearFechaInput(mensualidad.fecha_fin),
            valor: mensualidad.valor ?? ''
        });
        setModalDetallesAbierto(true);
    };
    const handlePropietarioChange = (e) => {
        const value = e.target.value;
        if (value === '' || regexPropietario.test(value)) {
            setFormData({ ...formData, propietario: value });
        }
    };
    const handleTipoVehiculoChange = (e) => {
        const tipoSeleccionado = e.target.value;
        setFormData({ ...formData, tipo: tipoSeleccionado });

        // Buscar la tarifa correspondiente al tipo seleccionado
        if (tarifas && tarifas.length > 0 && tipoSeleccionado) {
            try {
                const tarifaEncontrada = tarifas.find(
                    (t) => t.tipo && t.tipo.toUpperCase() === tipoSeleccionado.toUpperCase()
                );
                if (tarifaEncontrada) {
                    const valorMensual = tarifaEncontrada.valor_mensual ?? tarifaEncontrada.valor ?? tarifaEncontrada.valor_dia ?? 0;
                    setFormData((prev) => ({
                        ...prev,
                        tipo: tipoSeleccionado,
                        valor: valorMensual > 0 ? String(valorMensual) : ''
                    }));
                    console.log(`✅ Tarifa autocompletada para ${tipoSeleccionado}: $${valorMensual}`);
                } else {
                    setFormData((prev) => ({ ...prev, tipo: tipoSeleccionado, valor: '' }));
                    console.log(`⚠️ No se encontró tarifa para ${tipoSeleccionado}`);
                }
            } catch (err) {
                console.error('Error buscando tarifa:', err);
            }
        }
    };
    const guardarMensualidad = async (e) => {
        e.preventDefault();
        if (!propietarioValido || !formData.propietario?.trim()) {
            toast.error('El propietario solo puede contener letras y espacios');
            return;
        }
        if (!formData.nivel_servicio?.trim()) {
            toast.error('Debe seleccionar un nivel de servicio');
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
            console.log('Payload mensualidad:', payload);
            if (modoEdicion) {
                await api.put(`/mensualidades/${formData.id}`, payload);
                toast.success("Mensualidad actualizada");
            } else {
                await api.post('/mensualidades', payload);
                toast.success("Mensualidad creada");
            }
            setModalAbierto(false);
            cargarMensualidades();
        } catch (err) {
            const data = err.response?.data;
            const campos = Array.isArray(data?.fields) ? `: ${data.fields.join(', ')}` : '';
            const mensaje = data?.message || err.message || 'Error al guardar';
            console.error('Error guardando mensualidad:', data || err);
            toast.error(`${mensaje}${campos}`);
        }
    };
    const eliminar = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar esta mensualidad?")) {
            try {
                await api.delete(`/mensualidades/${id}`);
                cargarMensualidades();
                toast.success("Eliminado correctamente");
            } catch (err) {
                toast.error("No se pudo eliminar");
            }
        }
    };
    return (
        <div className="mensualidades-page">
            <div className="card">
            <div className="header-actions">
                <h2>Gestión de Mensualidades</h2>
                <button className="btn-add" onClick={abrirNuevoModal}>
                    <FaPlus /> Nueva Mensualidad
                </button>
            </div>
                <div className="table-container">
        <table className="mensualidades-table">
            <thead>
                <tr>
                    <th>Placa</th><th>Tipo</th><th>Servicio</th><th>Propietario</th><th>Teléfono</th><th>Vigencia</th><th>Valor</th><th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {mensualidades.map(m => (
                    <tr key={m.id}>
                        <td>{m.placa}</td>
                        <td>{m.tipo}</td>
                        <td>{m.nivel_servicio}</td>
                        <td>{m.propietario}</td>
                        <td>{m.telefono}</td>
                        {/* Aquí verás toda la fecha sin cortes */}
                        <td>{formatearFechaInput(m.vigencia || m.fecha_inicio)} - {formatearFechaInput(m.fecha_fin)}</td>
                        <td>${Number(m.valor).toLocaleString()}</td>
                        <td className="actions">
                        {esOperario ? (
                            <button onClick={() => abrirModalDetalles(m)} title="Ver detalles">
                                <FiEye />
                            </button>
                        ) : (
                            <>
                            <button onClick={() => abrirEditarModal(m)} title="Editar"><FiEdit2 /></button>
                            <button className="delete" onClick={() => eliminar(m.id)} title="Eliminar"><FiTrash2 /></button>
                            </>
                        )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</div>
            {modalAbierto && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{modoEdicion ? 'Editar' : 'Nueva'} Mensualidad</h3>
                        </div>
                        <form onSubmit={guardarMensualidad}>
                            <label>Placa *</label>
                            <input placeholder="ABC123" value={formData.placa || ''} onChange={e => setFormData({...formData, placa: e.target.value.toUpperCase()})} maxLength={6} required />
                            <label>Tipo de Vehículo * {tarifasError && <span className="warning-badge">⚠️ Ingreso manual</span>}</label>
                            <select value={formData.tipo || ''} onChange={handleTipoVehiculoChange} required>
                                <option value="">Seleccione...</option>
                                {tarifas && tarifas.length > 0 ? (
                                    tarifas.map((tarifa) => (
                                        <option key={tarifa.id_tipo} value={tarifa.tipo}>
                                            {tarifa.tipo} {tarifa.valor_mensual > 0 ? `- $${Number(tarifa.valor_mensual).toLocaleString('es-CO')}/mes` : ''}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="AUTOMOVIL">Automóvil, Campero, Camioneta, Microbus, Motocarro</option>
                                        <option value="MOTOCICLETA">Motocicleta</option>
                                        <option value="BICICLETA">Bicicleta</option>
                                    </>
                                )}
                            </select>
                            <label>Nivel de Servicio *</label>
                            <select value={formData.nivel_servicio || ''} onChange={e => setFormData({...formData, nivel_servicio: e.target.value})} required>
                                <option value="">Seleccione...</option>
                                <option value="ALTURA">Altura</option>
                                <option value="SUBTERRANEO">Subterraneo</option>
                            </select>
                            <label>Propietario *</label>
                            <input placeholder="Nombre completo"
                            value={formData.propietario || ''}
                            onChange={handlePropietarioChange}
                            disabled={modoEdicion}
                            required />
                            {!propietarioValido && (
                                <small className="form-error">Solo se permiten letras y espacios.</small>
                            )}
                            <label>Teléfono *</label>
                            <input type="tel" placeholder="300 000 0000" value={formData.telefono || ''} onChange={e => setFormData({...formData, telefono: e.target.value.replace(/\D/g, '')})} maxLength={10} required />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Fecha Inicio *</label>
                                    <input type="date" value={formData.vigencia || ''}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => {
                                        const nuevaInicio = e.target.value;
                                        setFormData({...formData, vigencia: nuevaInicio, fecha_fin: sumarDias(nuevaInicio, 30)});
                                    }} required />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Fecha Fin *</label>
                                    <input type="date" value={formData.fecha_fin || ''} onChange={e => setFormData({...formData, fecha_fin: e.target.value})} required />
                                </div>
                            </div>
                            <label>Valor Pagado ($) * {formData.tipo && !tarifasError && tarifas.find(t => t.tipo === formData.tipo) && <span className="info-badge">✅ Autocompletado</span>}</label>
                            <input
                                type="number"
                                value={formData.valor || ''}
                                onChange={e => setFormData({...formData, valor: e.target.value})}
                                readOnly={!tarifasError}
                                className="input-bloqueado"
                                placeholder={tarifasError ? "Ingrese el valor" : "Se completará automáticamente"}
                                required
                            />
                            <div className="modal-btns">
                            {/* Agregamos la clase btn-comun a ambos para unificar tamaño */}
                            <button
                                type="submit"
                                className="btn-comun btn-actualizar"
                                disabled={!propietarioValido || !formData.propietario?.trim()}
                            >
                                {modoEdicion ? 'Actualizar' : 'Guardar'}
                            </button>
                            <button
                                type="button"
                                className="btn-comun btn-cancelar"
                                onClick={() => setModalAbierto(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                        </form>
                    </div>
                </div>
            )}
            {modalDetallesAbierto && mensualidadDetalle && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Detalle de Mensualidad</h3>
                        </div>
                        <form>
                            <label>Placa</label>
                            <input value={mensualidadDetalle.placa || ''} disabled />

                            <label>Tipo de Vehículo</label>
                            <select value={mensualidadDetalle.tipo || ''} disabled>
                                <option value="">Seleccione...</option>
                                {tarifas && tarifas.length > 0 ? (
                                    tarifas.map((tarifa) => (
                                        <option key={tarifa.id_tipo} value={tarifa.tipo}>
                                            {tarifa.tipo} {tarifa.valor_mensual > 0 ? `- $${Number(tarifa.valor_mensual).toLocaleString('es-CO')}/mes` : ''}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="AUTOMOVIL">Automóvil, Campero, Camioneta, Microbus, Motocarro</option>
                                        <option value="MOTOCICLETA">Motocicleta</option>
                                        <option value="BICICLETA">Bicicleta</option>
                                    </>
                                )}
                            </select>

                            <label>Nivel de Servicio</label>
                            <select value={mensualidadDetalle.nivel_servicio || ''} disabled>
                                <option value="">Seleccione...</option>
                                <option value="ALTURA">Altura</option>
                                <option value="SUBTERRANEO">Subterraneo</option>
                            </select>

                            <label>Propietario</label>
                            <input value={mensualidadDetalle.propietario || ''} disabled />

                            <label>Teléfono</label>
                            <input value={mensualidadDetalle.telefono || ''} disabled />

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Fecha Inicio</label>
                                    <input type="date" value={mensualidadDetalle.vigencia || ''} disabled />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Fecha Fin</label>
                                    <input type="date" value={mensualidadDetalle.fecha_fin || ''} disabled />
                                </div>
                            </div>

                            <label>Valor Pagado ($)</label>
                            <input
                                type="number"
                                value={mensualidadDetalle.valor || ''}
                                disabled
                            />

                            <div className="modal-btns">
                                <button
                                    type="button"
                                    className="btn-comun btn-cancelar"
                                    onClick={() => {
                                        setModalDetallesAbierto(false);
                                        setMensualidadDetalle(null);
                                    }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <div id="toast-alerta" className="toast-oculto">Operación realizada</div>
        </div>
    );
};

export default Mensualidades;
