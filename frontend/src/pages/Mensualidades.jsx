import React, { useState } from 'react';
import './Mensualidades.css';

const Mensualidades = () => {
  // Estado simulado con los datos del prototipo de Figma
  const [mensualidades, setMensualidades] = useState([
    {
      id: 1,
      placa: 'ABC123',
      tipo: 'Carro',
      propietario: 'María González',
      telefono: '3001234567',
      vigencia: '31/3/2026 - 30/4/2026',
      valor: '$250.000'
    },
    {
      id: 2,
      placa: 'XYZ789',
      tipo: 'Moto',
      propietario: 'Pedro Martínez',
      telefono: '3009876543',
      vigencia: '31/3/2026 - 30/4/2026',
      valor: '$150.000'
    }
  ]);

  return (
    <div className="mensualidades-container">
      {/* Encabezado de la vista */}
      <div className="mensualidades-header">
        <button className="btn-close-icon" aria-label="Cerrar">
          ✕
        </button>
        <div className="header-titles">
          <h2>Mensualidades</h2>
          <p>Gestión en altura y subterráneo</p>
        </div>
      </div>

      {/* Tarjeta principal */}
      <div className="mensualidades-card">
        <div className="card-header-info">
          <div className="icon-badge-purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/>
              <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z"/>
            </svg>
          </div>
          <div>
            <h3>Consulta de Mensualidades</h3>
            <p>Visualización de vehículos con mensualidad activa</p>
          </div>
        </div>

        <h4 className="table-title">Mensualidades Activas ({mensualidades.length})</h4>

        {/* Tabla de datos */}
        <div className="table-responsive">
          <table className="mensualidades-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Tipo</th>
                <th>Propietario</th>
                <th>Teléfono</th>
                <th>Vigencia</th>
                <th>Valor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {mensualidades.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.placa}</strong></td>
                  <td>{item.tipo}</td>
                  <td>{item.propietario}</td>
                  <td>{item.telefono}</td>
                  <td>{item.vigencia}</td>
                  <td>{item.valor}</td>
                  <td>
                    <button className="btn-action-eye" aria-label="Ver detalles">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Mensualidades;