import React, { useState, useEffect } from 'react';
import './ControlParqueadero.css';

const ControlParqueadero = () => {
  // Estado simulado basado en tu Figma (idealmente esto vendrá del Backend)
  const [stats, setStats] = useState({
    total: 100,
    ocupados: 2,
    disponibles: 98
  });

  const [niveles, setNiveles] = useState([
    { nombre: 'Nivel 1', total: 30, ocupados: 1, disponibles: 29, porcentaje: 3 },
    { nombre: 'Nivel 2', total: 25, ocupados: 1, disponibles: 24, porcentaje: 4 },
    { nombre: 'Nivel 3', total: 25, ocupados: 0, disponibles: 25, porcentaje: 0 },
    { nombre: 'Subterráneo', total: 20, ocupados: 0, disponibles: 20, porcentaje: 0 }
  ]);

  const [vehiculos, setVehiculos] = useState([
    { placa: 'DEF456', tipo: 'Carro', nivel: 'Nivel 1', horaIngreso: '08:30 a. m.', tiempo: '1200h 54m', estado: 'Temporal' },
    { placa: 'GHI789', tipo: 'Moto', nivel: 'Nivel 2', horaIngreso: '10:15 a. m.', tiempo: '1199h 9m', estado: 'Temporal' }
  ]);

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
          <select className="level-filter">
            <option>Todos los niveles</option>
            <option>Nivel 1</option>
            <option>Nivel 2</option>
            <option>Nivel 3</option>
            <option>Subterráneo</option>
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
            {vehiculos.map((veh, index) => (
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