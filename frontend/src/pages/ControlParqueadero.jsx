import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/alex

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
<<<<<<< HEAD
          <select className="level-filter">
            <option>Todos los niveles</option>
            <option>Nivel 1</option>
            <option>Nivel 2</option>
            <option>Nivel 3</option>
            <option>Subterráneo</option>
=======
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
>>>>>>> origin/alex
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
<<<<<<< HEAD
            {vehiculos.map((veh, index) => (
=======
            {vehiculosFiltrados.map((veh, index) => (
>>>>>>> origin/alex
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