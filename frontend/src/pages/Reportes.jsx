<<<<<<< HEAD
import React, { useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Calendar, FileText, Download } from 'lucide-react'; // Iconos para el diseño
import './Reportes.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Reportes = () => {
  const [filtros, setFiltros] = useState({ fechaInicio: '', fechaFin: '' });

  // Datos simulados (próximamente los traeremos de tu base de datos MySQL)
  const transacciones = [
    { id: 1, placa: 'ABC123', tipo: 'Carro', servicio: 'Mensual', fecha: '2026-06-01', ingreso: '08:00', salida: '18:00', tiempo: '10h', valor: 0, estado: 'Pagado' },
    { id: 2, placa: 'XYZ789', tipo: 'Moto', servicio: 'Ocasional', fecha: '2026-06-05', ingreso: '09:00', salida: '11:00', tiempo: '2h', valor: 2000, estado: 'Pagado' },
    { id: 3, placa: 'DEF456', tipo: 'Carro', servicio: 'Ocasional', fecha: '2026-06-10', ingreso: '10:00', salida: '16:00', tiempo: '6h', valor: 8000, estado: 'Pendiente' },
    { id: 4, placa: 'MNO321', tipo: 'Moto', servicio: 'Mensual', fecha: '2026-06-12', ingreso: '07:00', salida: '17:00', tiempo: '10h', valor: 0, estado: 'Pagado' },
    { id: 5, placa: 'BIK111', tipo: 'Bicicleta', servicio: 'Ocasional', fecha: '2026-06-15', ingreso: '14:00', salida: '15:30', tiempo: '1.5h', valor: 1000, estado: 'Pagado' },
    { id: 6, placa: 'BIK222', tipo: 'Bicicleta', servicio: 'Mensual', fecha: '2026-06-17', ingreso: '08:00', salida: '17:00', tiempo: '9h', valor: 0, estado: 'Pagado' },
  ];

  const datosFiltrados = useMemo(() => {
    return transacciones.filter(tx => {
      if (!filtros.fechaInicio && !filtros.fechaFin) return true;
      if (filtros.fechaInicio && !filtros.fechaFin) return tx.fecha >= filtros.fechaInicio;
      if (!filtros.fechaInicio && filtros.fechaFin) return tx.fecha <= filtros.fechaFin;
      return tx.fecha >= filtros.fechaInicio && tx.fecha <= filtros.fechaFin;
    });
  }, [filtros, transacciones]);

=======
import React, { useState } from 'react';
import './Reportes.css';

const Reportes = () => {
  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    tipoReporte: 'ingresos',
    rangoFechas: 'hoy'
  });

  // Datos simulados para la tabla de transacciones
  const transacciones = [
    { id: 1, fecha: '12/05/2026 14:30', placa: 'ABC123', tipo: 'Carro', valor: '$4.500', operario: 'Juan V.' },
    { id: 2, fecha: '12/05/2026 14:15', placa: 'XYZ789', tipo: 'Moto', valor: '$2.000', operario: 'Juan V.' },
    { id: 3, fecha: '12/05/2026 13:50', placa: 'DEF456', tipo: 'Carro', valor: '$8.000', operario: 'Pedro M.' },
    { id: 4, fecha: '12/05/2026 13:20', placa: 'MNO321', tipo: 'Moto', valor: '$2.000', operario: 'Juan V.' },
  ];

>>>>>>> origin/alex
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  const handleExportPDF = () => {
<<<<<<< HEAD
    const doc = new jsPDF();
    doc.text("Reporte de Transacciones", 14, 20);
    autoTable(doc, {
      startY: 35,
      head: [["Placa", "Tipo", "Servicio", "Ingreso", "Salida", "Tiempo", "Valor", "Estado"]],
      body: datosFiltrados.map(tx => [tx.placa, tx.tipo, tx.servicio, tx.ingreso, tx.salida, tx.tiempo, formatCurrency(tx.valor), tx.estado]),
    });
    doc.save("Reporte_Filtrado.pdf");
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  const stats = useMemo(() => ({
    totalIngresos: datosFiltrados.length,
    totalSalidas: datosFiltrados.filter(t => t.estado === 'Pagado').length,
    totalRecaudo: datosFiltrados.filter(t => t.servicio !== 'Mensual').reduce((acc, curr) => acc + curr.valor, 0),
  }), [datosFiltrados]);

  const dataCantidad = {
    labels: ['Automóviles', 'Motocicletas', 'Bicicletas'],
    datasets: [{ label: 'Cantidad', data: [datosFiltrados.filter(t => t.tipo === 'Carro').length, datosFiltrados.filter(t => t.tipo === 'Moto').length, datosFiltrados.filter(t => t.tipo === 'Bicicleta').length], backgroundColor: '#3182ce' }],
  };

  const dataRecaudo = {
    labels: ['Automóviles', 'Motocicletas', 'Bicicletas'],
    datasets: [{ label: 'Recaudo ($)', data: [datosFiltrados.filter(t => t.tipo === 'Carro' && t.servicio !== 'Mensual').reduce((a, b) => a + b.valor, 0), datosFiltrados.filter(t => t.tipo === 'Moto' && t.servicio !== 'Mensual').reduce((a, b) => a + b.valor, 0), datosFiltrados.filter(t => t.tipo === 'Bicicleta' && t.servicio !== 'Mensual').reduce((a, b) => a + b.valor, 0)], backgroundColor: '#48bb78' }],
=======
    console.log("Generando PDF con filtros:", filtros);
    alert("Generando reporte en PDF...");
  };

  const handleExportExcel = () => {
    console.log("Generando Excel con filtros:", filtros);
    alert("Generando reporte en Excel...");
>>>>>>> origin/alex
  };

  return (
    <div className="reportes-container">
<<<<<<< HEAD
      <div className="report-card mb-24">
        <div className="filters-row">
          <span>Fecha inicio</span>
            <input type="date" name="fechaInicio" onChange={handleFilterChange} />
            <span>Fecha Fin</span>
            <input type="date" name="fechaFin" onChange={handleFilterChange} />
            <button className="btn-export pdf" onClick={handleExportPDF}><Download size={18}/> Exportar PDF</button>
        </div>
      </div>

      <div className="stats-header-grid">
        <div className="report-card stat-box">
            <div className="icon-wrapper blue"><Calendar size={24} /></div>
            <span>Total Ingresos</span><h3>{stats.totalIngresos}</h3>
        </div>
        <div className="report-card stat-box">
            <div className="icon-wrapper green"><FileText size={24} /></div>
            <span>Total Salidas</span><h3>{stats.totalSalidas}</h3>
        </div>
        <div className="report-card stat-box">
            <div className="icon-wrapper purple"><Download size={24} /></div>
            <span>Total Recaudo</span><h3>{formatCurrency(stats.totalRecaudo)}</h3>
        </div>
      </div>

      <div className="stats-grid mb-24">
        <div className="report-card"><h3>Ingresos por Tipo</h3><Bar data={dataCantidad} /></div>
        <div className="report-card"><h3>Recaudo por Tipo</h3><Bar data={dataRecaudo} /></div>
      </div>

      <div className="report-card">
        <h3>Últimas Transacciones</h3>
        <table className="transactions-table">
          <thead>
            <tr><th>Placa</th><th>Tipo</th><th>Servicio</th><th>Ingreso</th><th>Salida</th><th>Tiempo</th><th>Valor</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {datosFiltrados.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.placa}</td><td>{tx.tipo}</td><td>{tx.servicio}</td><td>{tx.ingreso}</td><td>{tx.salida}</td><td>{tx.tiempo}</td><td>{formatCurrency(tx.valor)}</td><td>{tx.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
=======
      {/* Encabezado */}
      <div className="header-page-wrapper">
        <div className="header-titles">
          <h2>Reportes</h2>
          <p>Visualización y exportación de datos</p>
        </div>
        <button className="btn-close-icon" aria-label="Cerrar vista" title="Cerrar">
          ✕
        </button>
      </div>

      {/* Tarjeta 1: Filtros y Exportación */}
      <div className="report-card mb-24">
        <div className="card-header">
          <div>
            <h3>Generar Reporte General</h3>
            <p>Filtre y descargue la información</p>
          </div>
        </div>

        <div className="filters-row">
          <div className="form-group">
            <label>Tipo de reporte</label>
            <select name="tipoReporte" value={filtros.tipoReporte} onChange={handleFilterChange}>
              <option value="ingresos">Ingresos</option>
              <option value="mensualidades">Mensualidades</option>
              <option value="ocupacion">Ocupación</option>
            </select>
          </div>
          <div className="form-group">
            <label>Rango de fechas</label>
            <select name="rangoFechas" value={filtros.rangoFechas} onChange={handleFilterChange}>
              <option value="hoy">Hoy</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
            </select>
          </div>
          <div className="export-actions">
            <button className="btn-export pdf" onClick={handleExportPDF}>
              <span className="icon-pdf">📄</span> Generar PDF
            </button>
            <button className="btn-export excel" onClick={handleExportExcel}>
              <span className="icon-excel">📊</span> Generar Excel
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas (2 Columnas) */}
      <div className="stats-grid mb-24">
        {/* Tarjeta 2: Resumen de Ingresos */}
        <div className="report-card">
          <div className="card-header border-none">
            <h3>Resumen de Ingresos</h3>
          </div>
          <div className="summary-stats">
            <div className="stat-item">
              <div className="stat-icon green-bg">💰</div>
              <div className="stat-info">
                <span>Total hoy</span>
                <h4>$1'250.000</h4>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon blue-bg">🚗</div>
              <div className="stat-info">
                <span>Vehículos atendidos</span>
                <h4>145</h4>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon purple-bg">📅</div>
              <div className="stat-info">
                <span>Mensualidades nuevas</span>
                <h4>3</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Ocupación Promedio */}
        <div className="report-card">
          <div className="card-header border-none">
            <h3>Ocupación Promedio</h3>
          </div>
          <div className="occupancy-stats">
            <div className="occupancy-item">
              <div className="occupancy-header">
                <span>Altura</span>
                <span className="text-red font-bold">85% - Nivel crítico</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar fill-red" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="occupancy-item">
              <div className="occupancy-header">
                <span>Subterráneo</span>
                <span className="text-green font-bold">45% - Normal</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar fill-green" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta 4: Últimas Transacciones */}
      <div className="report-card">
        <div className="card-header">
          <h3>Últimas Transacciones</h3>
        </div>
        <div className="table-responsive">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Operario</th>
                <th>Recibo</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.fecha}</td>
                  <td><strong>{tx.placa}</strong></td>
                  <td>{tx.tipo}</td>
                  <td><strong>{tx.valor}</strong></td>
                  <td>{tx.operario}</td>
                  <td>
                    <button className="btn-icon-only" aria-label="Ver recibo" title="Ver recibo">
                      📄
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
>>>>>>> origin/alex
      </div>
    </div>
  );
};

export default Reportes;