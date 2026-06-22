import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ControlParqueadero.css';

const ControlParqueadero = () => {
  // Inicializamos los estados limpios para recibir la data real del backend
  const [stats, setStats] = useState({
    total: 0,
    ocupados: 0,
    disponibles: 0
  });

  const [niveles, setNiveles] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [filtroNivel, setFiltroNivel] = useState('Todos los niveles');

  // Petición al backend al cargar la pantalla
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const respuesta = await axios.get('http://localhost:3000/api/control/datos');
        if (respuesta.data.success) {
          const { stats, niveles, vehiculos } = respuesta.data.data;
          setStats(stats);
          setNiveles(niveles);
          setVehiculos(vehiculos);
        }
      } catch (error) {
        console.error("Error al conectar con la API de control:", error);
      }
    };

    cargarDatos();

    // Actualiza la información en segundo plano cada 60 segundos
    const intervalo = setInterval(cargarDatos, 60000);
    return () => clearInterval(intervalo);
  }, []);

  // Filtrado reactivo según la opción que elija el usuario en el select
  const vehiculosFiltrados = filtroNivel === 'Todos los niveles'
    ? vehiculos
    : vehiculos.filter(veh => veh.nivel === filtroNivel);

  return (
    <div className="control-container">
      <div className="control-header">
        <h2>Control Parqueadero</h2>
        <p> Gestión en altura y subterráneo</p>
      </div>

      {/* Tarjetas de Resumen General */}
      <div className="summary-cards">
        <div className="card">
          <span>Total de Espacios</span>
          <div className="card-content">
            <h3>{stats.total}</h3>
            <div className="icon-badge blue">℗</div>
          </div>
        </div>
        <div className="card">
          <span>Espacios Ocupados</span>
          <div className="card-content">
            <h3>{stats.ocupados}</h3>
            <div className="icon-badge orange">🚗</div>
          </div>
        </div>
        <div className="card">
          <span>Espacios Disponibles</span>
          <div className="card-content">
            <h3>{stats.disponibles}</h3>
            <div className="icon-badge green">✓</div>
          </div>
        </div>
      </div>

      {/* Ocupación por Nivel */}
      <div className="levels-section section-card">
        <h3>Ocupación por Nivel</h3>
        <div className="levels-grid">
          {niveles.map((nivel, index) => (
            <div className="level-card" key={index}>
              <h4>{nivel.nombre}</h4>
              <div className="level-stats">
                <p>Total: <strong>{nivel.total}</strong></p>
                <p>Ocupados: <strong className={nivel.ocupados > 0 ? "text-red" : "text-green"}>{nivel.ocupados}</strong></p>
                <p>Disponibles: <strong className="text-green">{nivel.disponibles}</strong></p>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${nivel.porcentaje}%` }}></div>
              </div>
              <p className="percentage-text">{nivel.porcentaje}% ocupado</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de Vehículos */}
      <div className="table-section section-card">
        <div className="table-header">
          <h3>Vehículos en el Parqueadero</h3>
          <select 
            className="level-filter"
            value={filtroNivel}
            onChange={(e) => setFiltroNivel(e.target.value)}
          >
            <option value="Todos los niveles">Todos los niveles</option>
            <option value="Nivel 1">Nivel 1</option>
            <option value="Nivel 2">Nivel 2</option>
            <option value="Nivel 3">Nivel 3</option>
            <option value="Subterráneo">Subterráneo</option>
          </select>
        </div>
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Tipo</th>
              <th>Nivel/Zona</th>
              <th>Hora Ingreso</th>
              <th>Tiempo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {vehiculosFiltrados.map((veh, index) => (
              <tr key={index}>
                <td><strong>{veh.placa}</strong></td>
                <td>{veh.tipo}</td>
                <td>{veh.nivel}</td>
                <td>{veh.horaIngreso}</td>
                <td>{veh.tiempo}</td>
                <td><span className="badge-temporal">{veh.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ControlParqueadero;