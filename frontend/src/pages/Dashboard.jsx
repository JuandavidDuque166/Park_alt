import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaCar, FaParking, FaMoneyBillWave, FaSignInAlt } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './Dashboard.css';

// Registramos los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [data, setData] = useState({
    vehiculosActivos: 0,
    espaciosDisponibles: 0,
    espaciosTotales: 0,
    recaudoDia: 0,
    entradasDia: 0,
    ultimosIngresos: [],
    vehiculosportipo: [], 
    ocupacion: []         
  });

  useEffect(() => {
    const obtenerEstadisticas = async () => {
      try {
        const respuesta = await api.get('/dashboard/resumen');
        if (respuesta.data?.data) {
          setData(prev => ({
            ...prev,
            ...respuesta.data.data,
            vehiculosportipo: respuesta.data.data.vehiculosportipo || respuesta.data.data.vehiculosPorTipo || prev.vehiculosportipo,
            ocupacion: respuesta.data.data.ocupacion || prev.ocupacion
          }));
        }
      } catch (error) {
        console.error('Error al cargar:', error);
      }
    };

    obtenerEstadisticas();

    const manejarActualizacion = () => {
      obtenerEstadisticas();
    };

    window.addEventListener('actualizar_datos_parqueadero', manejarActualizacion);
    return () => {
      window.removeEventListener('actualizar_datos_parqueadero', manejarActualizacion);
    };
  }, []);

  // Formateador de moneda para el recaudo
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  // ==========================================
  // CONFIGURACIÓN GRÁFICO DE BARRAS (TIPO VEHÍCULO)
  // ==========================================
  const tiposVehiculo = Array.isArray(data.vehiculosPorTipo)
    ? data.vehiculosPorTipo
    : Array.isArray(data.vehiculosportipo)
      ? data.vehiculosportipo
      : [];

  const obtenerTotalPorTipo = (nombres) => {
    const coincidencia = tiposVehiculo.find((v) => {
      const nombre = String(v.nombre || v.tipo || v.TIPO || '').toUpperCase();
      return nombres.some((valor) => nombre.includes(valor));
    });

    if (coincidencia) {
      return Number(coincidencia.total ?? coincidencia.cantidad ?? coincidencia.TOTAL ?? coincidencia.COUNT ?? 0);
    }

    if (Array.isArray(data.ultimosIngresos) && data.ultimosIngresos.length > 0) {
      return data.ultimosIngresos.filter((v) => {
        const texto = String(v.tipo || v.nombre || '').toUpperCase();
        return nombres.some((valor) => texto.includes(valor));
      }).length;
    }

    return 0;
  };

  const totalAutomoviles = obtenerTotalPorTipo(['AUTOMOVIL', 'AUTOMÓVIL', 'CAMPERO', 'CAMIONETA']);
  const totalMotocicletas = obtenerTotalPorTipo(['MOTOCICLETA', 'MOTO', 'MOTOCARRO']);
  const totalBicicletas = obtenerTotalPorTipo(['BICICLETA', 'BICI']);

  const dataBarras = {
    labels: ['Automóviles', 'Motocicletas', 'Bicicletas'],
    datasets: [{
      label: 'Cantidad',
      data: [totalAutomoviles, totalMotocicletas, totalBicicletas],
      backgroundColor: '#3182ce',
      borderRadius: 4
    }]
  };

  const opcionesBarras = {
    scales: {
      y: {
        ticks: { stepSize: 1 }, // Solo números enteros enteros (1, 2, 3...)
        beginAtZero: true
      }
    },
    maintainAspectRatio: false
  };

  // ==========================================
  // CONFIGURACIÓN GRÁFICO CIRCULAR (OCUPACIÓN)
  // ==========================================
  const espaciosOcupados = Number(data.vehiculosActivos ?? 0);
  const espaciosDisponibles = Math.max(Number(data.espaciosDisponibles ?? (Number(data.espaciosTotales || 0) - espaciosOcupados) ?? 0), 0);

  const dataPie = {
    labels: ['Disponibles', 'Ocupados'],
    datasets: [{
      data: [espaciosDisponibles, espaciosOcupados],
      backgroundColor: ['#a0aec0', '#3182ce'], 
      borderWidth: 2,
    }]
  };

  const opcionesPie = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="dashboard-content">
      <main className="main-content">
        <header className="top-header">
          <h1>Inicio</h1>
          <p>Gestión en altura y subterráneo</p>
        </header>

        <section className="metrics-grid">
          <MetricCard title="Vehículos Activos" value={data.vehiculosActivos} sub="En el parqueadero" icon={<FaCar />} color="blue" />
          <MetricCard title="Espacios Disponibles" value={data.espaciosDisponibles} sub={`de ${data.espaciosTotales} totales`} icon={<FaParking />} color="green" />
          <MetricCard title="Recaudo del Día" value={formatCurrency(data.recaudoDia)} sub="Total recaudado" icon={<FaMoneyBillWave />} color="purple" />
          <MetricCard title="Entradas del Día" value={data.entradasDia} sub="Ingresos registrados" icon={<FaSignInAlt />} color="orange" />
        </section>

        <section className="charts-grid">
          {/* GRÁFICO DE BARRAS */}
          <div className="chart-card">
            <h3>Vehículos por Tipo</h3>
            <div style={{ height: '250px', position: 'relative' }}>
              <Bar data={dataBarras} options={opcionesBarras} />
            </div>
          </div>
          
          {/* GRÁFICO CIRCULAR */}
          <div className="chart-card">
            <h3>Ocupación del Parqueadero</h3>
            <div style={{ height: '250px', position: 'relative' }}>
              <Pie data={dataPie} options={opcionesPie} />
            </div>
          </div>
        </section>

        <section className="table-section">
          <h3>Últimos Vehículos Ingresados</h3>
          <table className="data-table">
            <thead>
              <tr><th>Placa</th><th>Tipo</th><th>Nivel/Zona</th><th>Hora Ingreso</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {data.ultimosIngresos?.map((v, i) => (
                <tr key={i}>
                  <td className="bold">{v.placa}</td>
                  <td>{v.tipo}</td>
                  <td>{v.nivel}</td>
                  <td>{v.hora}</td>
                  <td><span className="badge-success">{v.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

const MetricCard = ({ title, value, sub, icon, color }) => (
  <div className="metric-card">
    <div className="card-info">
      <h3>{title}</h3>
      <p className="big-number">{value}</p>
      <span className="subtitle">{sub}</span>
    </div>
    <div className={`icon ${color}`}>{icon}</div>
  </div>
);

export default Dashboard;