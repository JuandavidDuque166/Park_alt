import React, { useState } from 'react';
import './IngresoVehiculo.css';

const IngresoVehiculo = () => {
  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    placa: '',
    idTipo: '',
    nivel: '',
    foto: null // Objeto File
  });

  // Estados para UI (Mensajes y carga)
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Manejador para inputs de texto y selects
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'placa' ? value.toUpperCase() : value,
    });
  };

  // Manejador específico para el archivo (foto)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      foto: file || null
    });
  };

  // Limpiar el formulario
  const handleLimpiar = () => {
    setFormData({ placa: '', idTipo: '', nivel: '', foto: null });
    // Nota: No limpiamos el mensaje aquí para que el usuario pueda leer el éxito después de limpiar los campos
    const fileInput = document.getElementById('foto-input');
    if (fileInput) fileInput.value = '';
  };

  // Envío del formulario al Backend REAL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje({ tipo: '', texto: '' });

    // 1. Construir el FormData con los datos exactos que espera el Backend
    const dataToSend = new FormData();
    dataToSend.append('placa', formData.placa);
    dataToSend.append('idTipo', formData.idTipo);
    dataToSend.append('nivel', formData.nivel);
    dataToSend.append('idUsuario', '2'); // Simulando el ID del operario logueado
    
    if (formData.foto) {
      dataToSend.append('foto', formData.foto);
    }

    try {
      // 2. Petición HTTP al Backend
      // Asegúrate de que la URL coincida con el puerto de tu backend (ej. http://localhost:3000)
      const response = await fetch('http://localhost:3000/api/ingresos', {
        method: 'POST',
        body: dataToSend, // NO usar Content-Type manual con FormData
      });

      const result = await response.json();

      // 3. Evaluar la respuesta del servidor
      if (response.ok && result.success) {
        // ÉXITO: El backend nos devuelve el espacio asignado
        setMensaje({ 
          tipo: 'success', 
          texto: `¡Ingreso exitoso! Asigne al conductor el espacio #${result.data.espacioAsignado}` 
        });
        handleLimpiar(); // Limpiamos el formulario para el siguiente vehículo
      } else {
        // ERROR DEL NEGOCIO (Ej: Ya está adentro, no hay cupos)
        setMensaje({ 
          tipo: 'error', 
          texto: result.error || 'Ocurrió un error al registrar el ingreso.' 
        });
      }

    } catch (error) {
      // ERROR DE RED (Backend apagado, problemas de CORS)
      console.error('Error de red al registrar ingreso:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error de conexión. Verifique que el servidor backend esté en ejecución.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ingreso-container">
      <div className="ingreso-header-page">
        <h2>Ingreso Vehículos</h2>
        <p>Gestión en altura y subterráneo</p>
      </div>

      <div className="ingreso-card">
        <div className="card-header">
          <div>
            <h3>Registro de Ingreso de Vehículos</h3>
            <p>Complete los datos del vehículo que ingresa</p>
          </div>
          <div className="espacios-badge">
            <span>Espacios disponibles</span>
            <strong>98 / 100</strong>
          </div>
        </div>

        {mensaje.texto && (
          <div className={`alert-message ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Placa *</label>
              <input
                type="text"
                name="placa"
                placeholder="Ej: ABC123"
                value={formData.placa}
                onChange={handleInputChange}
                maxLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo de Vehículo *</label>
              <select name="idTipo" value={formData.idTipo} onChange={handleInputChange} required>
                <option value="">Seleccione</option>
                <option value="1">Carro</option>
                <option value="2">Moto</option>
                <option value="3">Bicicleta</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nivel / Zona *</label>
              <select name="nivel" value={formData.nivel} onChange={handleInputChange} required>
                <option value="">Seleccione</option>
                <option value="ALTURA">Altura</option>
                <option value="SOTANO">Sótano</option>
              </select>
            </div>

            <div className="form-group">
              <label>Foto (Evidencia) *</label>
              <input
                id="foto-input"
                type="file"
                name="foto"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                className="file-input"
                required
              />
            </div>
          </div>

          <div className="info-box">
            <p><strong>Fecha y hora:</strong> Se registrarán automáticamente al momento del ingreso</p>
            <p><strong>Vigilante:</strong> Juan Vigilante (Operario)</p>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando en BD...' : 'Registrar Ingreso'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => { handleLimpiar(); setMensaje({tipo: '', texto: ''}); }} disabled={isLoading}>
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IngresoVehiculo;