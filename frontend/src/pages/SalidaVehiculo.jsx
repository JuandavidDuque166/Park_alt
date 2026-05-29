import React, { useState } from 'react';
import './SalidaVehiculo.css';

const SalidaVehiculo = () => {
  // Estado para almacenar la placa ingresada
  const [placa, setPlaca] = useState('');

  // Función para manejar la búsqueda del vehículo
  const handleBuscar = (e) => {
    e.preventDefault(); // Evita que la página se recargue
    if (placa.trim() === '') {
      alert('Por favor, ingrese una placa válida.');
      return;
    }
    
    // Aquí irá la petición al backend (API) para consultar la placa
    console.log(`Buscando información de la placa: ${placa}`);
    // Ejemplo: fetch(`/api/vehiculos/salida/${placa}`)
  };

  return (
    <div className="salida-container">
      {/* Encabezado de la vista */}
      <div className="salida-header">
        <button className="btn-close-icon" aria-label="Cerrar">
          ✕
        </button>
        <div className="header-titles">
          <h2>Salida Vehículos</h2>
          <p>Gestión en altura y subterráneo</p>
        </div>
      </div>

      {/* Tarjeta principal de búsqueda */}
      <div className="search-card">
        <h3>Buscar Vehículo por Placa</h3>
        
        <form className="search-form" onSubmit={handleBuscar}>
          <input
            type="text"
            className="search-input"
            placeholder="Ingrese la placa del vehículo"
            value={placa}
            onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            maxLength={6} // Límite estándar para placas en Colombia (Ej: ABC123)
            autoComplete="off"
          />
          <button type="submit" className="btn-buscar">
            {/* Icono de Lupa SVG incrustado para mayor rendimiento */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              fill="currentColor" 
              className="icon-search" 
              viewBox="0 0 16 16"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
            Buscar
          </button>
        </form>
      </div>
    </div>
  );
};

export default SalidaVehiculo;