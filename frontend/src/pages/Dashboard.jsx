import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaCar, FaParking, FaMoneyBillWave, FaSignInAlt } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
        // Imprimimos para ver qué nos manda la API y corregir los dataKey
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
          <MetricCard title="Recaudo del Día" value={`$${data.recaudoDia}`} sub="Total recaudado" icon={<FaMoneyBillWave />} color="purple" />
          <MetricCard title="Entradas del Día" value={data.entradasDia} sub="Ingresos registrados" icon={<FaSignInAlt />} color="orange" />
        </section>

        <section className="charts-grid">
          {/* GRÁFICO DE BARRAS */}
          <div className="chart-card">
            <h3>Vehículos por Tipo</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.vehiculosportipo || []}>
                <XAxis dataKey="nombre" /> {/* CAMBIA 'nombre' SI TU API USA OTRO NOMBRE */}
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#8884d8" /> {/* CAMBIA 'total' SI TU API USA OTRO NOMBRE */}
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* GRÁFICO CIRCULAR */}
          <div className="chart-card">
            <h3>Ocupación del Parqueadero</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                  data={data.ocupacion || []} 
                  dataKey="total" /* CAMBIA 'total' SEGÚN TU API */
                  nameKey="nombre" /* CAMBIA 'nombre' SEGÚN TU API */
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  label
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