import React, { useState, useEffect } from "react";
import { api } from "../services/api"; 
import { authService } from "../services/authService";
import "./IngresoVehiculo.css";

const IngresoVehiculo = () => {
  const [formData, setFormData] = useState({
    placa: "",
    idTipo: "",
    nivel: "",
    foto: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [cupos, setCupos] = useState({ disponibles: 0, total: 0 });
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  // 1. Cargar datos del operario y consultar cupos iniciales
  useEffect(() => {
    const user = authService.obtenerUsuario();
    if (user) setUsuarioActual(user);
    cargarCupos();
  }, []);

  const cargarCupos = async () => {
    try {
      const response = await api.get("/ingresos/cupos");
      if (response.data) {
        setCupos({
          disponibles: response.data.disponibles,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error("Error cargando cupos del parqueadero:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "placa" ? value.toUpperCase() : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      foto: file || null,
    });
  };

  const handleLimpiar = () => {
    setFormData({
      placa: "",
      idTipo: "",
      nivel: "",
      foto: null,
    });
    const fileInput = document.getElementById("foto-input");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje({ tipo: "", texto: "" });

    // Preparar el FormData para enviar archivos multimedia (Multer)
    const dataToSend = new FormData();
    dataToSend.append("placa", formData.placa);
    dataToSend.append("id_tipo", formData.idTipo);
    dataToSend.append("nivel", formData.nivel);
    if (usuarioActual) {
      dataToSend.append("idUsuario", usuarioActual.id_usuario);
    }
    if (formData.foto) {
      dataToSend.append("foto", formData.foto);
    }

    try {
      // Usamos la instancia 'api' de axios en vez de fetch nativo
      const response = await api.post("/ingresos", dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setMensaje({
          tipo: "success",
          texto: `¡Ingreso exitoso! Asigne al conductor el espacio #${response.data.data.espacioAsignado}`,
        });
        handleLimpiar();
        cargarCupos(); // Actualiza el contador de la esquina superior derecha
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "Ocurrió un error al registrar el ingreso.";
      setMensaje({
        tipo: "error",
        texto: errorMsg,
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

      <div className="content-body">
        <div className="ingreso-card">
          <div className="card-header">
            <div>
              <h3>Registro de Ingreso de Vehículos</h3>
              <p>Complete los datos del vehículo que ingresa</p>
            </div>

            <div className="espacios-badge">
              <span>Espacios disponibles</span>
              <strong>{cupos.disponibles} / {cupos.total}</strong>
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
                  placeholder="ABC123"
                  value={formData.placa}
                  onChange={handleInputChange}
                  maxLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo de Vehículo *</label>
                <select
                  name="idTipo"
                  value={formData.idTipo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione</option>
                  <option value="1">Automóvil</option>
                  <option value="6">Motocicleta</option>
                  <option value="7">Bicicleta</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nivel / Zona *</label>
                <select
                  name="nivel"
                  value={formData.nivel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione</option>
                  <option value="ALTURA">Nivel Altura</option>
                  <option value="SUBTERRANEO">Subterráneo</option>
                </select>
              </div>

              <div className="form-group">
                <label>Foto Evidencia</label>
                <input
                  id="foto-input"
                  type="file"
                  name="foto"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="info-box">
              <p>
                <strong>Fecha y hora:</strong> Se registrarán automáticamente al ingresar.
              </p>
              <p>
                <strong>Operario en turno:</strong> {usuarioActual?.nombre || "Cargando..."}
              </p>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Registrar Ingreso"}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  handleLimpiar();
                  setMensaje({ tipo: "", texto: "" });
                }}
                disabled={isLoading}
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IngresoVehiculo;