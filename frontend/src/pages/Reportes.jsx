import React, { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Download, Wallet, LogIn, LogOut } from 'lucide-react';
import { api } from '../services/api';
import './Reportes.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Reportes = () => {
  const [filtros, setFiltros] = useState({ fechaInicio: '', fechaFin: '' });
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(false);

  // Petición al Backend en Express (CommonJS)
  useEffect(() => {
    const fetchReportes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
        if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);

        const response = await api.get(`/reportes?${params.toString()}`);
        const result = response.data;

        if (result.success) {
          setTransacciones(result.data);
        } else {
          console.error("Error del servidor:", result.message);
        }
      } catch (error) {
        console.error("Error conectando con la API de reportes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportes();
  }, [filtros.fechaInicio, filtros.fechaFin]);

  // Al filtrar directo en MySQL, los datos mostrados son idénticos a los recibidos
  const datosFiltrados = useMemo(() => transacciones, [transacciones]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Transacciones - Parqueadero", 14, 20);
    autoTable(doc, {
      startY: 35,
      head: [["Placa", "Tipo", "Servicio", "Fecha", "Ingreso", "Salida", "Tiempo", "Valor", "Estado"]],
      body: datosFiltrados.map(tx => [
        tx.placa, 
        tx.tipo, 
        tx.servicio, 
        tx.fecha,
        tx.ingreso, 
        tx.salida, 
        tx.tiempo, 
        formatCurrency(tx.valor), 
        tx.estado
      ]),
    });
    doc.save(`Reporte_Parqueadero_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // Cálculos estadísticos reactivos a los datos de la DB
  const stats = useMemo(() => ({
    totalIngresos: datosFiltrados.length,
    totalSalidas: datosFiltrados.filter(t => t.estado === 'Pagado').length,
    totalRecaudo: datosFiltrados.reduce((acc, curr) => acc + Number(curr.valor), 0),
  }), [datosFiltrados]);

  // Configuración de Gráficos mapeados con ENUMs de tu Script SQL
  const dataCantidad = {
    labels: ['Automóviles', 'Motocicletas', 'Bicicletas'],
    datasets: [{ 
      label: 'Cantidad', 
      data: [
        datosFiltrados.filter(t => t.tipo === 'AUTOMOVIL' || t.tipo === 'CAMPERO' || t.tipo === 'CAMIONETA').length, 
        datosFiltrados.filter(t => t.tipo === 'MOTOCICLETA' || t.tipo === 'MOTOCARRO').length, 
        datosFiltrados.filter(t => t.tipo === 'BICICLETA').length
      ], 
      backgroundColor: '#3182ce' 
    }],
  };

  const dataRecaudo = {
    labels: ['Automóviles', 'Motocicletas', 'Bicicletas'],
    datasets: [{ 
      label: 'Recaudo ($)', 
      data: [
        datosFiltrados.filter(t => t.tipo === 'AUTOMOVIL' || t.tipo === 'CAMPERO' || t.tipo === 'CAMIONETA').reduce((a, b) => a + Number(b.valor), 0), 
        datosFiltrados.filter(t => t.tipo === 'MOTOCICLETA' || t.tipo === 'MOTOCARRO').reduce((a, b) => a + Number(b.valor), 0), 
        datosFiltrados.filter(t => t.tipo === 'BICICLETA').reduce((a, b) => a + Number(b.valor), 0)
      ], 
      backgroundColor: '#48bb78' 
    }],
  };

  return (
    <div className="reportes-container">
      {/* Sección de Filtros */}
      <div className="report-card mb-24">
        <div className="filters-row">
          <span>Fecha inicio</span>
          <input type="date" name="fechaInicio" value={filtros.fechaInicio} onChange={handleFilterChange} />
          <span>Fecha fin</span> 
          <input type="date" name="fechaFin" value={filtros.fechaFin} onChange={handleFilterChange} />
          <button className="btn-export pdf" onClick={handleExportPDF} disabled={loading || datosFiltrados.length === 0}>
            <Download size={18}/> Exportar PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Cargando información del servidor...</p>
        </div>
      ) : (
        <>
          {/* Tarjetas de Indicadores */}
          <div className="stats-header-grid">
            <div className="report-card stat-box">
              <div className="icon-wrapper blue"><LogIn size={24} /></div>
              <div>
                <span>Total Ingresos</span>
                <h3>{stats.totalIngresos}</h3>
              </div>
            </div>
            <div className="report-card stat-box">
              <div className="icon-wrapper green"><LogOut size={24} /></div>
              <div>
                <span>Total Salidas</span>
                <h3>{stats.totalSalidas}</h3>
              </div>
            </div>
            <div className="report-card stat-box">
              <div className="icon-wrapper purple"><Wallet size={24} /></div>
              <div>
                <span>Total Recaudo</span>
                <h3>{formatCurrency(stats.totalRecaudo)}</h3>
              </div>
            </div>
          </div>

          {/* Gráficas Estadísticas */}
          <div className="stats-grid mb-24">
            <div className="report-card">
              <h3>Ingresos por Tipo de Vehículo</h3>
              <Bar data={dataCantidad} />
            </div>
            <div className="report-card">
              <h3>Recaudo por Tipo de Vehículo</h3>
              <Bar data={dataRecaudo} />
            </div>
          </div>

          {/* Tabla de Registros en Tiempo Real */}
          <div className="report-card">
            <h3>Últimas Transacciones Procesadas</h3>
            <div className="table-responsive">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Placa</th>
                    <th>Tipo</th>
                    <th>Servicio</th>
                    <th>Fecha</th>
                    <th>Ingreso</th>
                    <th>Salida</th>
                    <th>Tiempo</th>
                    <th>Valor</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {datosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                        No se encontraron registros en el rango de fechas seleccionado.
                      </td>
                    </tr>
                  ) : (
                    datosFiltrados.map((tx) => (
                      <tr key={tx.id}>
                        <td><strong>{tx.placa}</strong></td>
                        <td>{tx.tipo}</td>
                        <td>
                          <span className={`badge ${tx.servicio.toLowerCase()}`}>
                            {tx.servicio}
                          </span>
                        </td>
                        <td>{tx.fecha}</td>
                        <td>{tx.ingreso}</td>
                        <td>{tx.salida}</td>
                        <td>{tx.tiempo}</td>
                        <td>{formatCurrency(tx.valor)}</td>
                        <td>
                          <span className={`status-pill ${tx.estado.toLowerCase()}`}>
                            {tx.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reportes;