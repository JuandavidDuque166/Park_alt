import React, { useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import './tarifas.css';

const Tarifas = () => {
    const [tarifas, setTarifas] = useState([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tarifaSeleccionada, setTarifaSeleccionada] = useState(null);
    const [formData, setFormData] = useState({
        id_tipo: '',
        valor_hora: '',
        valor_fraccion: '',
        valor_dia: '',
        valor_mensual: ''
    });

    const mostrarAlerta = (mensaje) => {
        // Usamos querySelector para buscar la clase
        const toastElement = document.querySelector('.alerta-personalizada');
        if (toastElement) {
            toastElement.innerText = mensaje;
            toastElement.classList.add('toast-visible');
            setTimeout(() => toastElement.classList.remove('toast-visible'), 3000);
        }
    };

    const cargarTarifas = async () => {
        try {
            const response = await api.get('/tarifas');
            setTarifas(response.data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudieron cargar las tarifas');
        }
    };

    useEffect(() => {
        cargarTarifas();
    }, []);

    const abrirEditar = (tarifa) => {
        if (!tarifa || !tarifa.id_tipo) {
            toast.error('No se pudo cargar la tarifa para edición');
            return;
        }

        setModoEdicion(true);
        setTarifaSeleccionada(tarifa);
        setFormData({
            id_tipo: tarifa.id_tipo?.toString() ?? '',
            valor_hora: tarifa.valor_hora?.toString() ?? '',
            valor_fraccion: tarifa.valor_fraccion?.toString() ?? '',
            valor_dia: tarifa.valor_dia?.toString() ?? '',
            valor_mensual: tarifa.valor_mensual?.toString() ?? ''
        });
        setModalAbierto(true);
    };

    const guardarCambios = async (e) => {
        e.preventDefault();

        if (!tarifaSeleccionada?.id_tipo) {
            toast.error('No hay tarifa seleccionada para actualizar');
            return;
        }

        try {
            const payload = {
                id_tipo: Number(formData.id_tipo),
                valor_hora: Number(formData.valor_hora),
                valor_fraccion: Number(formData.valor_fraccion),
                valor_dia: Number(formData.valor_dia),
                valor_mensual: Number(formData.valor_mensual)
            };

            console.log('Enviando payload:', payload);

            await api.put(`/tarifas/${tarifaSeleccionada.id_tipo}`, payload);
            mostrarAlerta('Tarifa actualizada correctamente');
            toast.success('Tarifa actualizada correctamente');

            cargarTarifas();
            setModalAbierto(false);
        } catch (error) {
            console.error('Error al guardar tarifa:', error);
            console.error('Error response data:', error.response?.data);
            const serverMessage = error.response?.data?.message || error.message || 'No se pudo guardar la tarifa';
            toast.error(serverMessage);
        }
    }; 

    return (
        <div className="tarifas-page">
            <div className="tarifas-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Gestión de Tarifas</h2>
            </div>

            <table className="tarifas-table">
                <thead>
                    <tr>
                        <th>Tipo de vehículo</th>
                        <th>Valor Hora ($)</th>
                        <th>Valor Fracción ($)</th>
                        <th>Valor Día ($)</th>
                        <th>Valor Mensual ($)</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                {tarifas.map((t) => (
                    <tr key={t.id_tipo}>
                        <td>{t.tipo}</td>
                        {/* Usamos Number(valor) para asegurar que se pueda formatear */}
                        <td>${Number(t.valor_hora).toLocaleString('es-CO')}</td>
                        <td>${Number(t.valor_fraccion).toLocaleString('es-CO')}</td>
                        <td>${Number(t.valor_dia).toLocaleString('es-CO')}</td>
                        <td>${Number(t.valor_mensual).toLocaleString('es-CO')}</td>
                        <td className="actions-cell">
                            <button className="edit-icon" onClick={() => abrirEditar(t)}><FaEdit /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
            </table>
            {modalAbierto && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h3>Editar Tarifa</h3>
                        <form onSubmit={guardarCambios} className="modal-form">
                            <label>Tipo de Vehículo</label>
                            <input type="text" value={tarifaSeleccionada?.tipo || ''} disabled />
                            
                            <label>Valor Hora ($) *</label>
                            <input type="text" value={formData.valor_hora} onChange={e => setFormData({...formData, valor_hora: e.target.value.replace(/\D/g, '')})} required />

                            <label>Valor Fracción ($) *</label>
                            <input type="text" value={formData.valor_fraccion} onChange={e => setFormData({...formData, valor_fraccion: e.target.value.replace(/\D/g, '')})} required />

                            <label>Valor Día ($) *</label>
                            <input type="text" value={formData.valor_dia} onChange={e => setFormData({...formData, valor_dia: e.target.value.replace(/\D/g, '')})} required />

                            <label>Valor Mensual ($) *</label>
                            <input type="text" value={formData.valor_mensual} onChange={e => setFormData({...formData, valor_mensual: e.target.value.replace(/\D/g, '')})} required />

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
            <div className="alerta-personalizada">Tarifa actualizada correctamente</div>
        </div>
    );
};
export default Tarifas;