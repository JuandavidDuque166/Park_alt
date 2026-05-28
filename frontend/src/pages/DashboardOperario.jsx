import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './DashboardOperario.css';

const DashboardOperario = () => {
  // 2. ESTADO INICIAL
  // Iniciamos los contadores en 0 y las listas vacías para que la pantalla no falle mientras carga
  const [data, setData] = useState({
    vehiculosActivos: 0,
    espaciosDisponibles: 0,
    espaciosTotales: 0,
    recaudoDia: 0,
    entradasDia: 0,
    ultimosIngresos: []       // Array para la lista naranja (Visitantes)     // Array para la lista blanca (Aprendices, Instructores, etc.)
  });

  // 3. EFECTO DE CARGA (useEffect) ACTUALIZADO EN TIEMPO REAL
  useEffect(() => {
    const obtenerEstadisticas = async () => {
      try {
        const respuesta = await api.get('/dashboard/resumen');
        setData(respuesta.data?.data || {});
      } catch (error) {
        console.error('Error al cargar las estadísticas:', error.response?.data?.message || error.message || error);
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
        <section className="metrics-grid">
          <div className="metric-card">
            <div className="card-info">
              <h3>Vehículos Activos</h3>
              <p className="big-number">{data.vehiculosActivos}</p>
              <span className="subtitle">En el parqueadero</span>
            </div>
            <div className="icon blue">🚘</div>
          </div>
          <div className="metric-card">
            <div className="card-info">
              <h3>Espacios Disponibles</h3>
              <p className="big-number">{data.espaciosDisponibles}</p>
              <span className="subtitle">de {data.espaciosTotales} totales</span>
            </div>
            <div className="icon green">🅿️</div>
          </div>
          <div className="metric-card">
            <div className="card-info">
              <h3>Recaudo del Día</h3>
              <p className="big-number">${data.recaudoDia}</p>
              <span className="subtitle">0 salidas</span>
            </div>
            <div className="icon purple">💲</div>
          </div>
          <div className="metric-card">
            <div className="card-info">
              <h3>Entradas del Día</h3>
              <p className="big-number">{data.entradasDia}</p>
              <span className="subtitle">Ingresos registrados</span>
            </div>
            <div className="icon orange">↪️</div>
          </div>
        </section>

        {/* CHARTS SECTION (Simulada con CSS) */}
        <section className="charts-grid">
          <div className="chart-card">
            <h3>Vehículos por Tipo</h3>
            <div className="bar-chart-placeholder">
              <div className="bar-group">
                <div className="bar" style={{height: '100%'}}></div>
                <span>Carros</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{height: '100%'}}></div>
                <span>Motos</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{height: '10%'}}></div>
                <span>Bicicletas</span>
              </div>
            </div>
          </div>
          <div className="chart-card">
            <h3>Ocupación del Parqueadero</h3>
            <div className="pie-chart-placeholder">
              <div className="pie"></div>
            </div>
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

export default DashboardOperario;