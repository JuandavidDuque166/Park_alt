import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { api } from '../services/api';
import { FaCar, FaParking, FaMoneyBillWave, FaArrowDown } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import './Dashboard.css';

const COLORS = ['#3b82f6', '#10b981']; // Colores para los gráficos

const Dashboard = () => {
=======
import { useNavigate, Outlet, useLocation, NavLink, Link } from 'react-router-dom';
import './Dashboard.css';

  const Dashboard = () => {
  // 2. ESTADO INICIAL
  // Iniciamos los contadores en 0 y las listas vacías para que la pantalla no falle mientras carga
>>>>>>> origin/alex
  const [data, setData] = useState({
    vehiculosActivos: 0,
    espaciosDisponibles: 0,
    espaciosTotales: 0,
    recaudoDia: 0,
    entradasDia: 0,
<<<<<<< HEAD
    ultimosIngresos: [],
    vehiculosportipo: [], 
    ocupacion: [] 
  });

=======
    ultimosIngresos: []       // Array para la lista naranja (Visitantes)     // Array para la lista blanca (Aprendices, Instructores, etc.)
  });

  // 3. EFECTO DE CARGA (useEffect) ACTUALIZADO EN TIEMPO REAL
>>>>>>> origin/alex
  useEffect(() => {
    const obtenerEstadisticas = async () => {
      try {
        const respuesta = await api.get('/dashboard/resumen');
<<<<<<< HEAD
        setData(respuesta.data?.data || {});
      } catch (error) {
        console.error('Error al cargar:', error);
      }
    };
    obtenerEstadisticas();
  }, []);

  return (
    <div className="dashboard-content">
=======
        // Actualizamos nuestro estado con la información que mandó Node.js
        setData(respuesta.data.data);
      } catch (error) {
        console.error('Error al cargar las estadísticas:', error);
      }


    };
    obtenerEstadisticas();
    }, []);



  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-icon">🚘</span>
            <div>
              <h2>Sistema Parqueadero</h2>
              <p>Administrador</p>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to='/salida-vehiculos'>
            <p>↪️ Salida Vehículos</p>
          </NavLink>
          <button className="nav-item active">🏠 Inicio</button>
          <button className="nav-item">🅿️ Control Parqueadero</button>
          <button className="nav-item">💲 Tarifas</button>
          <button className="nav-item">📅 Mensualidades</button>
          <button className="nav-item">👥 Usuarios</button>
          <button className="nav-item">📊 Reportes</button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <p className="role-text">Usuario</p>
            <p className="name-text">Carlos Administrador</p>
          </div>
          <button className="btn-logout">↪ Cerrar Sesión</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
>>>>>>> origin/alex
      <main className="main-content">
        <header className="top-header">
          <h1>Inicio</h1>
          <p>Gestión en altura y subterráneo</p>
        </header>

        {/* TOP CARDS */}
        <section className="metrics-grid">
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/alex
          </div>
        </section>

        {/* TABLE SECTION */}
        <section className="table-section">
          <h3>Últimos Vehículos Ingresados</h3>
          <table className="data-table">
            <thead>
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/alex
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

<<<<<<< HEAD
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

=======
>>>>>>> origin/alex
export default Dashboard;