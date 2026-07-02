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
        console.log("DATOS BACKEND:", respuesta.data?.data);
        if (respuesta.data?.data) {
          setData(respuesta.data.data);
        }
      } catch (error) {
        console.error('Error al cargar:', error);
      }
    };
    obtenerEstadisticas();
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
  // 1. Intentamos obtener los datos agrupados que envía la API originalmente
  let totalAutomoviles = data.vehiculosportipo?.find(v => v.nombre?.toUpperCase() === 'AUTOMÓVILES' || v.nombre?.toUpperCase() === 'AUTOMOVIL' || v.tipo?.toUpperCase() === 'AUTOMOVIL')?.total || data.vehiculosportipo?.find(v => v.nombre?.toUpperCase() === 'AUTOMÓVILES' || v.nombre?.toUpperCase() === 'AUTOMOVIL' || v.tipo?.toUpperCase() === 'AUTOMOVIL')?.TOTAL || 0;
  let totalMotocicletas = data.vehiculosportipo?.find(v => v.nombre?.toUpperCase() === 'MOTOCICLETAS' || v.nombre?.toUpperCase() === 'MOTOCICLETA' || v.tipo?.toUpperCase() === 'MOTOCICLETA')?.total || data.vehiculosportipo?.find(v => v.nombre?.toUpperCase() === 'MOTOCICLETAS' || v.nombre?.toUpperCase() === 'MOTOCICLETA' || v.tipo?.toUpperCase() === 'MOTOCICLETA')?.TOTAL || 0;
  let totalBicicletas = data.vehiculosportipo?.find(v => v.nombre?.toUpperCase() === 'BICICLETAS' || v.nombre?.toUpperCase() === 'BICICLETA' || v.tipo?.toUpperCase() === 'BICICLETA')?.total || data.vehiculosportipo?.find(v => v.nombre?.toUpperCase() === 'BICICLETAS' || v.nombre?.toUpperCase() === 'BICICLETA' || v.tipo?.toUpperCase() === 'BICICLETA')?.TOTAL || 0;

  // 2. SALVAVIDAS ULTRA-FLEXIBLE: Si los totales anteriores dieron 0 pero la tabla tiene registros abajo, los contamos de ahí mismo
  if (totalAutomoviles === 0 && totalMotocicletas === 0 && totalBicicletas === 0 && data.ultimosIngresos?.length > 0) {
    data.ultimosIngresos.forEach(v => {
      // Convertimos todo el objeto del vehículo a string en mayúsculas para no fallar por nombres de columnas
      const textoFila = JSON.stringify(v).toUpperCase();
      
      if (textoFila.includes('AUTOMOVIL') || textoFila.includes('AUTOMÓVIL') || textoFila.includes('CAMPERO') || textoFila.includes('CAMIONETA')) {
        totalAutomoviles++;
      } else if (textoFila.includes('MOTOCICLETA') || textoFila.includes('MOTO') || textoFila.includes('MOTOCARRO')) {
        totalMotocicletas++;
      } else if (textoFila.includes('BICICLETA') || textoFila.includes('BICI')) {
        totalBicicletas++;
      }
    });
  }

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
  // Vinculamos los espacios ocupados directamente con las tarjetas de arriba para que sean idénticos
  const espaciosOcupados = data.vehiculosActivos || (totalAutomoviles + totalMotocicletas + totalBicicletas) || 0;
  const espaciosDisponibles = data.espaciosDisponibles || (data.espaciosTotales - espaciosOcupados) || 0;

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