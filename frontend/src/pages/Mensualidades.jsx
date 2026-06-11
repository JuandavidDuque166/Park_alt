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
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const esOperario = usuario?.rol === 'OPERARIO';
    const regexPropietario = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
    const propietarioValido = !formData.propietario || regexPropietario.test(formData.propietario);

    const mostrarAlerta = (mensaje) => {
        const toastElement = document.getElementById('toast-alerta');
        if (toastElement) {
            toastElement.innerText = mensaje;
            toastElement.classList.add('toast-visible');
            setTimeout(() => toastElement.classList.remove('toast-visible'), 3000);
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
            toast.error("No se pudieron cargar las tarifas.");
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
            id: null, placa: '', tipo: '', nivel_servicio: '', propietario: '', telefono: '', vigencia: hoyStr, fecha_fin: sumarDias(hoyStr, 30), valor: ''
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
        if (tarifas && tarifas.length > 0 && tipoSeleccionado) {
            const tarifaEncontrada = tarifas.find(t => t.tipo && t.tipo.toUpperCase() === tipoSeleccionado.toUpperCase());
            if (tarifaEncontrada) {
                const valorMensual = tarifaEncontrada.valor_mensual ?? tarifaEncontrada.valor ?? tarifaEncontrada.valor_dia ?? 0;
                setFormData(prev => ({ ...prev, tipo: tipoSeleccionado, valor: valorMensual > 0 ? String(valorMensual) : '' }));
            }
        }
    };

    const guardarMensualidad = async (e) => {
        e.preventDefault();
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
                mostrarAlerta("Mensualidad actualizada correctamente");
            } else {
                await api.post('/mensualidades', payload);
                mostrarAlerta("Mensualidad creada correctamente");
            }
            setModalAbierto(false);
            cargarMensualidades();
        } catch (err) {
            toast.error("Error al guardar la mensualidad");
        }
    };

    const eliminar = async (id) => {
        if (window.confirm("¿Seguro que deseas eliminar esta mensualidad?")) {
            try {
                await api.delete(`/mensualidades/${id}`);
                cargarMensualidades();
                mostrarAlerta("Eliminado correctamente");
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
                            <tr><th>Placa</th><th>Tipo</th><th>Servicio</th><th>Propietario</th><th>Teléfono</th><th>Vigencia</th><th>Valor</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {mensualidades.map(m => (
                                <tr key={m.id}>
                                    <td>{m.placa}</td>
                                    <td>{m.tipo}</td>
                                    <td>{m.nivel_servicio}</td>
                                    <td>{m.propietario}</td>
                                    <td>{m.telefono}</td>
                                    <td>{formatearFechaInput(m.vigencia || m.fecha_inicio)} - {formatearFechaInput(m.fecha_fin)}</td>
                                    <td>${Number(m.valor).toLocaleString()}</td>
                                    <td className="actions">
                                        {esOperario ? (
                                            <button onClick={() => abrirModalDetalles(m)}><FiEye /></button>
                                        ) : (
                                            <>
                                                <button onClick={() => abrirEditarModal(m)}><FiEdit2 /></button>
                                                <button className="delete" onClick={() => eliminar(m.id)}><FiTrash2 /></button>
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
                        <div className="modal-header"><h3>{modoEdicion ? 'Editar' : 'Nueva'} Mensualidad</h3></div>
                        <form onSubmit={guardarMensualidad}>
                            <label>Placa *</label>
                            <input value={formData.placa} onChange={e => setFormData({...formData, placa: e.target.value.toUpperCase()})} required maxLength={6}/>
                            <label>Tipo de Vehículo *</label>
                            <select value={formData.tipo} onChange={handleTipoVehiculoChange} required>
                                <option value="">Seleccione...</option>
                                {tarifas.map(t => <option key={t.id_tipo} value={t.tipo}>{t.tipo}</option>)}
                            </select>
                            <label>Nivel de Servicio *</label>
                            <select value={formData.nivel_servicio} onChange={e => setFormData({...formData, nivel_servicio: e.target.value})} required>
                                <option value="">Seleccione...</option>
                                <option value="ALTURA">Altura</option>
                                <option value="SUBTERRANEO">Subterraneo</option>
                            </select>
                            <label>Propietario *</label>
                            <input value={formData.propietario} onChange={handlePropietarioChange} disabled={modoEdicion} required />
                            <label>Teléfono *</label>
                            <input type="tel" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value.replace(/\D/g, '')})} required maxLength={10} />
                            <div className="fecha-row">
                            <div className="fecha-col">
                                <label>Inicio *</label>
                                <input 
                                    type="date" 
                                    className="fecha-input" 
                                    value={formData.vigencia} 
                                    onChange={e => setFormData({...formData, vigencia: e.target.value, fecha_fin: sumarDias(e.target.value, 30)})} 
                                    required 
                                />
                            </div>
                            <div className="fecha-col">
                                <label>Fin *</label>
                                <input 
                                    type="date" 
                                    className="fecha-input" 
                                    value={formData.fecha_fin} 
                                    onChange={e => setFormData({...formData, fecha_fin: e.target.value})} 
                                    required 
                                />
                            </div>
                            </div>
                            <label>Valor ($) *</label>
                            <input type="number" value={formData.valor} onChange={e => setFormData({...formData, valor: e.target.value})} readOnly={!tarifasError} required />
                            <div className="modal-btns">
                                <button type="submit" className="btn-comun btn-actualizar">{modoEdicion ? 'Actualizar' : 'Guardar'}</button>
                                <button type="button" className="btn-comun btn-cancelar" onClick={() => setModalAbierto(false)}>Cancelar</button>
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