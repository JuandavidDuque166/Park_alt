import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; // Importamos tu conexión al backend
import './SalidaVehiculo.css';

const SalidaVehiculo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [tipoServicioSalida, setTipoServicioSalida] = useState('Temporal');
  const [valorPagar, setValorPagar] = useState(0);
  
  // Iniciamos el estado vacío, ya no hay datos quemados
  const [vehiculos, setVehiculos] = useState([]);

  // Se ejecuta al cargar la pantalla para traer los carros parqueados
  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      const response = await api.get('/salidas/activos');
      if (response.data.success) {
        // Formateamos los datos del backend para que encajen EXACTAMENTE con tu diseño JSX
        const vehiculosFormateados = response.data.data.map(v => {
          const fechaIngreso = new Date(v.hora_ingreso);
          const horaIngresoCorta = isNaN(fechaIngreso.getTime())
            ? 'Fecha inválida'
            : fechaIngreso.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const horaIngresoLarga = isNaN(fechaIngreso.getTime())
            ? 'Fecha inválida'
            : fechaIngreso.toLocaleString();

          return {
            id_ingreso: v.id_ingreso,
            placa: v.placa,
            tipo: v.tipo_vehiculo || 'No definido',
            servicioBase: 'Descubierto',
            tipoServicio: 'Temporal',
            nivel: v.nivel || 'Nivel 1',
            horaIngresoCorta,
            horaIngresoLarga,
            tiempo: v.tiempo_formateado || 'Calculando...',
            estado: v.estado || 'Activo',
            valorEstimado: `$${v.valor_estimado || 0}`
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
    // Busca en los vehículos reales traídos de la base de datos
    const encontrado = vehiculos.find(v => v.placa.includes(searchTerm.toUpperCase()));
    if (encontrado) {
      setVehiculoSeleccionado(encontrado);
    } else {
      alert("Vehículo no encontrado en el parqueadero");
    }
  };

  const seleccionarVehiculo = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
    setTipoServicioSalida(vehiculo.tipoServicio || 'Temporal');
    setValorPagar(Number(vehiculo.valorEstimado.replace(/[^0-9]/g, '')) || 0);
  };

  const registrarSalida = async () => {
    try {
      const response = await api.post('/salidas/procesar', {
        id_ingreso: vehiculoSeleccionado.id_ingreso,
        metodo_pago: metodoPago
      });

      if (response.data.success) {
        const servicioActiva = response.data.mensualidad_activa;
        const totalCobrado = response.data.total_pagar;
        const tipoServicioBackend = response.data.tipo_servicio || (servicioActiva ? 'Mensualidad' : 'Temporal');

        alert(`¡Salida exitosa!\nPlaca: ${vehiculoSeleccionado.placa}\nServicio: ${tipoServicioBackend}\nCobrado: $${totalCobrado}\nPago en: ${metodoPago}`);
        setVehiculoSeleccionado(null);
        setSearchTerm('');
        setTipoServicioSalida('Temporal');
        setValorPagar(0);
        cargarVehiculos();
      }
    } catch (error) {
      console.error("Error al procesar la salida:", error);
      alert(error.response?.data?.error || "Ocurrió un error al intentar procesar la salida.");
    }
  };
  return (
    <div className="salida-container">
      {/* Cabecera */}
      <div className="salida-header">
        <button className="btn-close">✕</button>
        <div>
          <h2>Salida Vehículos</h2>
          <p>Gestión en altura y subterráneo</p>
        </div>
      </div>

      {/* Tarjeta de Búsqueda */}
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
          <button type="submit" className="btn-search">
            Buscar
          </button>
        </form>
      </div>

      {/* Tarjeta de Detalles del Vehículo (Renderizado Condicional) */}
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
              <span className="detail-value">{tipoServicioSalida}</span>
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
              <span>Valor estimado a pagar: <strong>{`$${valorPagar.toLocaleString('es-CO')}`}</strong></span>
            </div>
          </div>

          <div className="payment-section">
            <label className="detail-label">Método de Pago</label>
            <select 
              className="select-payment"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia </option>
            </select>
          </div>

          <button className="btn-register-exit" onClick={registrarSalida}>
            Registrar Salida
          </button>
        </div>
      )}

      {/* Tarjeta de Tabla de Vehículos */}
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
              {vehiculos.map((vehiculo, index) => (
                <tr key={index}>
                  <td><strong>{vehiculo.placa}</strong></td>
                  <td>{vehiculo.tipo}</td>
                  <td>{vehiculo.servicioBase}</td>
                  <td>{vehiculo.nivel}</td>
                  <td>{vehiculo.horaIngresoCorta}</td>
                  <td>{vehiculo.tiempo}</td>
                  <td>
                    <span className="badge-temporal">{vehiculo.estado}</span>
                  </td>
                  <td>
                    <button 
                      className="btn-exit" 
                      onClick={() => seleccionarVehiculo(vehiculo)}
                    >
                      Salida
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalidaVehiculo;