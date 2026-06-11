import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './DashboardAdmin.css';

const DashboardAdmin = () => {
  // 2. ESTADO INICIAL
  // Iniciamos los contadores en 0 y las listas vacías para que la pantalla no falle mientras carga
  const [data, setData] = useState({
    vehiculosActivos: [],
    espaciosDisponibles: [],
    espaciosTotales: [],
    recaudoDia: [],
    entradasDia: [],
    ultimosIngresos: [],
    vehiculosportipo: [],
    ocupacion: []
  });
  const [error, setError] = useState('');

  // 3. EFECTO DE CARGA (useEffect) ACTUALIZADO EN TIEMPO REAL
  useEffect(() => {
    const obtenerEstadisticas = async () => {
      try {
        const respuesta = await api.get('/dashboard/resumen');
        setData(respuesta.data?.data || {});
        setError('');
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Error al obtener estadísticas del dashboard';
        console.error('Error al cargar las estadísticas:', message, error);
        setError(message);
      }


    };
    obtenerEstadisticas();
    }, []);



  return (
    <div className="dashboard-content">
      <main className="main-content">
        <header className="top-header">
          <h1>Inicio</h1>
          <p>Gestión en altura y subterráneo</p>
        </header>

        {/* TOP CARDS */}
        {error && (
          <section className="error-banner">
            <p>Error al cargar estadísticas: {error}</p>
          </section>
        )}
        <section className="metrics-grid">
          <div className="metric-card">
            <div className="card-info">
              <h3>Vehículos Activos</h3>
              <p className="big-number">{data.vehiculosActivos}</p>
              <span className="subtitle">En el parqueadero</span>
            </div>
            <div className="icon blue"></div>
          </div>
          <div className="metric-card">
            <div className="card-info">
              <h3>Espacios Disponibles</h3>
              <p className="big-number">{data.espaciosDisponibles}</p>
              <span className="subtitle">de {data.espaciosTotales} totales</span>
            </div>
            <div className="icon green"></div>
          </div>
          <div className="metric-card">
            <div className="card-info">
              <h3>Recaudo del Día</h3>
              <p className="big-number">${data.recaudoDia}</p>
              <span className="subtitle">0 salidas</span>
            </div>
            <div className="icon purple"></div>
          </div>
          <div className="metric-card">
            <div className="card-info">
              <h3>Entradas del Día</h3>
              <p className="big-number">{data.entradasDia}</p>
              <span className="subtitle">Ingresos registrados</span>
            </div>
            <div className="icon orange"></div>
          </div>
        </section>

        {/* TABLE SECTION */}
        <section className="table-section">
          <h3>Últimos Vehículos Ingresados</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Nivel/Zona</th>
                <th>Hora Ingreso</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.ultimosIngresos.map((vehiculo, index) => (
                <tr key={index}>
                  <td className="bold">{vehiculo.placa}</td>
                  <td>{vehiculo.tipo}</td>
                  <td>{vehiculo.nivel}</td>
                  <td>{vehiculo.hora}</td>
                  <td><span className="badge-success">{vehiculo.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default DashboardAdmin;