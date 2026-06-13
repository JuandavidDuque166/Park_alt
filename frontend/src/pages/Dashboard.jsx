import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaCar, FaParking, FaMoneyBillWave, FaArrowDown } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import './Dashboard.css';

const COLORS = ['#3b82f6', '#10b981']; // Colores para los gráficos

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
        setData(respuesta.data?.data || {});
      } catch (error) {
        console.error('Error al cargar:', error);
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
          <MetricCard title="Vehículos Activos" value={data.vehiculosActivos} sub="En el parqueadero" icon={<FaCar />} color="blue" />
          <MetricCard title="Espacios Disponibles" value={data.espaciosDisponibles} sub={`de ${data.espaciosTotales} totales`} icon={<FaParking />} color="green" />
          <MetricCard title="Recaudo del Día" value={`$${data.recaudoDia}`} sub="0 salidas" icon={<FaMoneyBillWave />} color="purple" />
          <MetricCard title="Entradas del Día" value={data.entradasDia} sub="Ingresos registrados" icon={<FaArrowDown />} color="orange" />
        </section>

        {/* CHARTS SECTION */}
        <section className="charts-grid">
          {/* Bar Chart */}
          <div className="chart-card">
            <h3>Vehículos por Tipo</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.vehiculosportipo || []}>
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="chart-card">
            <h3>Ocupación del Parqueadero</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.ocupacion || []}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="valor"
                >
                  {(data.ocupacion || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* TABLE SECTION */}
        <section className="table-section">
          <h3>Últimos Vehículos Ingresados</h3>
          <table className="data-table">
            <thead>
              <tr><th>Placa</th><th>Tipo</th><th>Nivel/Zona</th><th>Hora Ingreso</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {/* Uso de ?. para evitar errores de renderizado inicial */}
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