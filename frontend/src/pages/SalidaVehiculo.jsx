import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; 
import './SalidaVehiculo.css';

const SalidaVehiculo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [tipoServicioSalida, setTipoServicioSalida] = useState('Temporal');
  const [valorPagar, setValorPagar] = useState(0);
  const [vehiculos, setVehiculos] = useState([]);

  // Se ejecuta al cargar la pantalla y escucha el evento de sincronización
  useEffect(() => {
    cargarVehiculos();

    const manejarActualizacion = () => {
      cargarVehiculos();
    };

    window.addEventListener("actualizar_datos_parqueadero", manejarActualizacion);
    return () => {
      window.removeEventListener("actualizar_datos_parqueadero", manejarActualizacion);
    };
  }, []);

  const cargarVehiculos = async () => {
    try {
      const response = await api.get('/salidas/activos');
      if (response.data.success) {
        const vehiculosFormateados = response.data.data.map(v => {
          // Normalización para prevenir de raíz el Invalid Date
const fechaString = v.hora_ingreso ? String(v.hora_ingreso).trim().replace(' ', 'T') : '';
          const fechaIngreso = new Date(fechaString);
          
          const horaIngresoCorta = isNaN(fechaIngreso.getTime())
            ? '---'
            : fechaIngreso.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          const horaIngresoLarga = isNaN(fechaIngreso.getTime())
            ? 'Fecha inválida'
            : fechaIngreso.toLocaleString();

          // Comprobación de mensualidad activa en base a los campos comunes que manda tu backend
          const esMensual = v.tipo_servicio === 'Mensualidad' || v.tieneMensualidad === true || v.es_mensualidad === 1;

          return {
            id_ingreso: v.id_ingreso,
            placa: v.placa,
            tipo: v.tipo_vehiculo || 'No definido',
            servicioBase: esMensual ? 'Mensualidad Activa' : 'Descubierto',
            tipoServicio: esMensual ? 'Mensualidad' : 'Temporal',
            nivel: v.nivel || 'Nivel 1',
            horaIngresoCorta,
            horaIngresoLarga,
            tiempo: esMensual ? 'N/A (Mensualidad)' : (v.tiempo_formateado || 'Calculando...'),
            estado: v.estado || 'Activo',
            valorEstimado: esMensual ? 0 : (v.valor_estimado || 0),
            esMensualidad: esMensual
          };
        });
        setVehiculos(vehiculosFormateados);
      }
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const encontrado = vehiculos.find(v => v.placa.includes(searchTerm.trim().toUpperCase()));
    if (encontrado) {
      seleccionarVehiculo(encontrado);
    } else {
      alert("Vehículo no encontrado o no está registrado en el parqueadero actualmente.");
    }
  };

  const seleccionarVehiculo = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
    setTipoServicioSalida(vehiculo.tipoServicio);
    setValorPagar(vehiculo.esMensualidad ? 0 : Number(vehiculo.valorEstimado));
  };

  const registrarSalida = async () => {
    if (!vehiculoSeleccionado) return;
    try {
      const response = await api.post('/salidas/procesar', {
        id_ingreso: vehiculoSeleccionado.id_ingreso,
        metodo_pago: vehiculoSeleccionado.esMensualidad ? 'Efectivo' : metodoPago 
      });

      if (response.data.success) {
        alert(`¡Salida exitosa!\nPlaca: ${vehiculoSeleccionado.placa}\nServicio: ${vehiculoSeleccionado.tipoServicio}\nCobrado: $${vehiculoSeleccionado.esMensualidad ? '0' : response.data.total_pagar}\nPago procesado correctamente.`);
        setVehiculoSeleccionado(null);
        setSearchTerm('');
        setTipoServicioSalida('Temporal');
        setValorPagar(0);
        cargarVehiculos();
      }
    } catch (error) {
      console.error("Error al procesar la salida:", error);
      alert(error.response?.data?.error || "Ocurrió un error al intentar registrar la salida.");
    }
  };

  return (
    <div className="salida-container">
      <div className="salida-header">
        <button className="btn-close" onClick={() => setVehiculoSeleccionado(null)}>✕</button>
        <div>
          <h2>Salida Vehículos</h2>
          <p>Gestión en altura y subterráneo</p>
        </div>
      </div>

      <div className="card search-card">
        <h3>Buscar Vehículo por Placa</h3>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Ingrese la placa del vehículo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-search">Buscar</button>
        </form>
      </div>

      {vehiculoSeleccionado && (
        <div className="card detail-card">
          <h3>Información del Vehículo</h3>
          
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Placa</span>
              <span className="detail-value heavy">{vehiculoSeleccionado.placa}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tipo de Vehículo</span>
              <span className="detail-value">{vehiculoSeleccionado.tipo}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Nivel de Servicio</span>
              <span className="detail-value">{vehiculoSeleccionado.servicioBase}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tipo de Servicio</span>
              <span className="detail-value" style={{fontWeight: 'bold', color: vehiculoSeleccionado.esMensualidad ? '#2ecc71' : '#333'}}>
                {tipoServicioSalida}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Nivel / Zona</span>
              <span className="detail-value heavy">{vehiculoSeleccionado.nivel}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Hora de Ingreso</span>
              <span className="detail-value heavy">{vehiculoSeleccionado.horaIngresoLarga}</span>
            </div>
          </div>

          <div className="highlight-box">
            <div className="highlight-row">
              <span className="icon-blue">🕒</span>
              <span>Tiempo de Permanencia: <strong>{vehiculoSeleccionado.tiempo}</strong></span>
            </div>
            <div className="highlight-row">
              <span className="icon-blue">💲</span>
              <span>Valor estimado a pagar: <strong style={{fontSize: '1.4rem', color: vehiculoSeleccionado.esMensualidad ? '#2ecc71' : '#2ecc71'}}>
                {`$${valorPagar.toLocaleString('es-CO')}`}
              </strong></span>
            </div>
          </div>

          <div className="payment-section">
            <label className="detail-label">Método de Pago</label>
            <select 
              className="select-payment"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              disabled={vehiculoSeleccionado.esMensualidad}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>

          <button className="btn-register-exit" onClick={registrarSalida}>
            Registrar Salida
          </button>
        </div>
      )}

      <div className="card table-card">
        <h3>Vehículos en el Parqueadero ({vehiculos.length})</h3>
        <div className="table-responsive">
          <table className="salida-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Servicio</th>
                <th>Nivel/Zona</th>
                <th>Hora Ingreso</th>
                <th>Tiempo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.length === 0 ? (
                <tr><td colSpan="8" style={{textAlign: 'center', padding: '20px'}}>No hay vehículos dentro del parqueadero</td></tr>
              ) : (
                vehiculos.map((vehiculo, index) => (
                  <tr key={index} style={{backgroundColor: vehiculo.esMensualidad ? '#f4fff4' : 'transparent'}}>
                    <td><strong>{vehiculo.placa}</strong></td>
                    <td>{vehiculo.tipo}</td>
                    <td>{vehiculo.servicioBase}</td>
                    <td>{vehiculo.nivel}</td>
                    <td>{vehiculo.horaIngresoCorta}</td>
                    <td>{vehiculo.tiempo}</td>
                    <td>
                      <span className={vehiculo.esMensualidad ? "badge-mensualidad" : "badge-temporal"}>
                        {vehiculo.esMensualidad ? 'Mensual' : vehiculo.estado}
                      </span>
                    </td>
                    <td>
                      <button className="btn-exit" onClick={() => seleccionarVehiculo(vehiculo)}>
                        Salida
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalidaVehiculo;