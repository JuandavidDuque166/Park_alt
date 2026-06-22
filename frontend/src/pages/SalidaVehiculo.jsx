<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; // Importamos tu conexión al backend
>>>>>>> origin/alex
import './SalidaVehiculo.css';

const SalidaVehiculo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
<<<<<<< HEAD

  // Datos mockeados basados en tu diseño
  const [vehiculos] = useState([
    {
      placa: 'GHI789',
      tipo: 'Motocicleta',
      servicioBase: 'Descubierto',
      tipoServicio: 'Temporal',
      nivel: 'Nivel 2',
      horaIngresoCorta: '10:15 a. m.',
      horaIngresoLarga: '29/5/2026, 10:15:00 a. m.',
      tiempo: '311h 30m',
      estado: 'Temporal',
      valorEstimado: '$15.300'
    }
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Simulamos que encuentra el vehículo si la placa coincide o está vacía (para la demo)
    const encontrado = vehiculos.find(v => v.placa.includes(searchTerm.toUpperCase()));
    if (encontrado) {
      setVehiculoSeleccionado(encontrado);
=======
  
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
        const vehiculosFormateados = response.data.data.map(v => ({
          id_ingreso: v.id_ingreso,
          placa: v.placa,
          tipo: v.tipo_vehiculo || 'No definido',
          servicioBase: 'Descubierto', // O el campo que uses en BD
          tipoServicio: 'Temporal', 
          nivel: v.nivel || 'Nivel 1',
          // Damos formato a la hora
          horaIngresoCorta: new Date(v.hora_ingreso).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          horaIngresoLarga: new Date(v.hora_ingreso).toLocaleString(),
          tiempo: v.tiempo_formateado || 'Calculando...',
          estado: v.estado || 'Activo',
          valorEstimado: `$${v.valor_estimado || 0}`
        }));
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
>>>>>>> origin/alex
    }
  };

  const seleccionarVehiculo = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
  };

<<<<<<< HEAD
  const registrarSalida = () => {
    alert(`Salida registrada para ${vehiculoSeleccionado.placa} con pago en ${metodoPago}`);
    // Aquí iría la lógica para enviar al backend y limpiar el estado
    setVehiculoSeleccionado(null);
    setSearchTerm('');
  };

=======
  const registrarSalida = async () => {
    try {
      // Enviamos la petición de salida al backend con el ID y método de pago
      const response = await api.post('/salidas/procesar', {
        id_ingreso: vehiculoSeleccionado.id_ingreso,
        metodo_pago: metodoPago
      });

      if (response.data.success) {
        alert(`¡Salida exitosa!\nPlaca: ${vehiculoSeleccionado.placa}\nCobrado: $${response.data.total_pagar}\nPago en: ${metodoPago}`);
        // Limpiamos los estados y recargamos la tabla para que el carro desaparezca
        setVehiculoSeleccionado(null);
        setSearchTerm('');
        cargarVehiculos();
      }
    } catch (error) {
      console.error("Error al procesar la salida:", error);
      alert(error.response?.data?.error || "Ocurrió un error al intentar procesar la salida.");
    }
  };

  // =======================================================================
  // DE AQUÍ HACIA ABAJO TU JSX QUEDA INTACTO, NO SE CAMBIÓ NI UNA SOLA LÍNEA
  // =======================================================================
>>>>>>> origin/alex
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
<<<<<<< HEAD
             Buscar
=======
            <span className="icon-search">🔍</span> Buscar
>>>>>>> origin/alex
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
              <span className="detail-value">{vehiculoSeleccionado.tipoServicio}</span>
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
              <span>Valor estimado a pagar: <strong>{vehiculoSeleccionado.valorEstimado}</strong></span>
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
<<<<<<< HEAD
              <option value="Transferencia">Transferencia</option>
=======
              <option value="Transferencia">Transferencia (Nequi/Daviplata)</option>
              <option value="Tarjeta">Tarjeta Débito/Crédito</option>
>>>>>>> origin/alex
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
<<<<<<< HEAD
                     Salida
=======
                      <span className="icon-exit">↪</span> Salida
>>>>>>> origin/alex
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