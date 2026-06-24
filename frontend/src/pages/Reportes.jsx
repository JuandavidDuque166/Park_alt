import React, { useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Download, Wallet, LogIn, LogOut } from 'lucide-react'; // Iconos para el diseño
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  const handleExportPDF = () => {
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
  };

  return (
    <div className="reportes-container">
      <div className="report-card mb-24">
        <div className="filters-row">
          <span>Fecha inicio</span>
            <input type="date" name="fechaInicio" onChange={handleFilterChange} />
            <span>Fecha inicio</span>
            <input type="date" name="fechaFin" onChange={handleFilterChange} />
            <button className="btn-export pdf" onClick={handleExportPDF}><Download size={18}/> Exportar PDF</button>
        </div>
      </div>

      <div className="stats-header-grid">
        <div className="report-card stat-box">
            <div className="icon-wrapper blue"><LogIn size={24} /></div>
            <span>Total Ingresos</span><h3>{stats.totalIngresos}</h3>
        </div>
        <div className="report-card stat-box">
            <div className="icon-wrapper green"><LogOut size={24} /></div>
            <span>Total Salidas</span><h3>{stats.totalSalidas}</h3>
        </div>
        <div className="report-card stat-box">
            <div className="icon-wrapper purple"><Wallet size={24} /></div>
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
      </div>
    </div>
  );
};

export default Reportes;