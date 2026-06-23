import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const DashboardOperario = () => {
  // 2. ESTADO INICIAL COMPLETO
  // Incluimos contadores por tipo de vehículo para alimentar el gráfico de barras dinámicamente
  const [data, setData] = useState({
    vehiculosActivos: 0,
    espaciosDisponibles: 0,
    espaciosTotales: 0,
    recaudoDia: 0,
    entradasDia: 0,
    carrosCount: 0,
    motosCount: 0,
    bicicletasCount: 0,
    ultimosIngresos: [] 
  });

  // 3. EFECTO DE CARGA (useEffect) ACTUALIZADO EN TIEMPO REAL
  useEffect(() => {
    const obtenerEstadisticas = async () => {
      try {
        const respuesta = await api.get('/dashboard/resumen');
        if (respuesta.data?.success || respuesta.data?.data) {
          // Usamos una función de actualización para mezclar el estado previo 
          // y evitar que la app se rompa si el backend no envía alguna propiedad o arreglo
          setData(prev => ({
            ...prev,
            ...respuesta.data.data
          }));
        }
      } catch (error) {
        console.error('Error al cargar las estadísticas:', error.response?.data?.message || error.message || error);
      }
    };

    obtenerEstadisticas();

    // Sincronización automática: Refresca el dashboard cada 30 segundos en segundo plano
    const intervalo = setInterval(obtenerEstadisticas, 30000);
    return () => clearInterval(intervalo);
  }, []);

  // --- LÓGICA DE GRÁFICOS DINÁMICOS SIN ALTERAR EL CSS ---
  // 1. Gráfico de Barras: Buscamos el máximo para escalar la altura proporcionalmente al 100%
  const maxVehiculos = Math.max(data.carrosCount, data.motosCount, data.bicicletasCount, 1);
  const alturaCarros = `${(data.carrosCount / maxVehiculos) * 100}%`;
  const alturaMotos = `${(data.motosCount / maxVehiculos) * 100}%`;
  const alturaBicis = `${(data.bicicletasCount / maxVehiculos) * 100}%`;

  // 2. Gráfico de Torta: Calculamos el porcentaje de ocupación real para el gradiente cónico
  const porcentajeOcupacion = data.espaciosTotales > 0 
    ? Math.min(((data.espaciosTotales - data.espaciosDisponibles) / data.espaciosTotales) * 100, 100)
    : 0;

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
              <span className="subtitle">Ingresos del día</span>
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

        {/* CHARTS SECTION (Dinámica mediante estilos en línea) */}
        <section className="charts-grid">
          <div className="chart-card">
            <h3>Vehículos por Tipo</h3>
            <div className="bar-chart-placeholder">
              <div className="bar-group">
                <div className="bar" style={{ height: alturaCarros }}></div>
                <span>Carros ({data.carrosCount})</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: alturaMotos }}></div>
                <span>Motos ({data.motosCount})</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{ height: alturaBicis }}></div>
                <span>Bicicletas ({data.bicicletasCount})</span>
              </div>
            </div>
          </div>
          <div className="chart-card">
            <h3>Ocupación del Parqueadero</h3>
            <div className="pie-chart-placeholder">
              <div 
                className="pie" 
                style={{ 
                  background: `conic-gradient(#3b82f6 0% ${porcentajeOcupacion}%, #e5e7eb ${porcentajeOcupacion}% 100%)` 
                }}
              ></div>
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
              {data.ultimosIngresos && data.ultimosIngresos.map((vehiculo, index) => (
                <tr key={index}>
                  <td className="bold">{vehiculo.placa}</td>
                  <td>{vehiculo.tipo}</td>
                  <td>{vehiculo.nivel || vehiculo.nivel_zona}</td>
                  <td>{vehiculo.hora || vehiculo.horaIngreso}</td>
                  <td><span className="badge-success">{vehiculo.estado || 'En curso'}</span></td>
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