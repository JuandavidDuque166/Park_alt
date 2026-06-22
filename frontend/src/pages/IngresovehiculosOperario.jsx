import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam"; // IMPORTANTE: Nueva librería para la cámara
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
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false); // Nuevo estado para controlar si la cámara está abierta
  const [cupos, setCupos] = useState({ disponibles: 0, total: 0 });
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const webcamRef = useRef(null);

  // Configuración para que intente abrir la cámara trasera en celulares
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment" 
  };

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

  // Función auxiliar para convertir la foto tomada (base64) a un Archivo normal (File)
  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  };

  // Lógica para capturar la foto de la cámara y enviarla a la IA
  const captureAndScan = useCallback(async () => {
    if (!webcamRef.current) return;
    
    // 1. Tomamos la foto de la cámara
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    // 2. La convertimos a archivo para guardarla en el form y enviarla
    const imageFile = dataURLtoFile(imageSrc, 'placa_capturada.jpg');
    setFormData(prev => ({ ...prev, foto: imageFile }));

    // 3. Iniciamos el proceso de IA
    setIsScanning(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      const dataToScan = new FormData();
      dataToScan.append("imagen", imageFile); 

      // Cambia "/leer-placa" por tu endpoint real
      const response = await api.post("/ingresos/leer-placa", dataToScan, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success && response.data.placa) {
        setFormData(prev => ({
          ...prev,
          placa: response.data.placa.toUpperCase()
        }));
        setMensaje({ tipo: "success", texto: "¡Placa detectada y autocompletada por IA!" });
        setIsCameraOpen(false); // Cerramos la cámara al tener éxito
      } else {
        setMensaje({ tipo: "error", texto: "La IA no pudo detectar una placa clara. Intenta acercar la cámara." });
      }
    } catch (error) {
      console.error("Error en la lectura de placa con IA:", error);
      setMensaje({ tipo: "error", texto: "Error al comunicarse con el servicio de IA." });
    } finally {
      setIsScanning(false);
    }
  }, [webcamRef]);

  const handleLimpiar = () => {
    setFormData({
      placa: "",
      idTipo: "",
      nivel: "",
      foto: null,
    });
    setIsCameraOpen(false); // También cerramos la cámara al limpiar
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje({ tipo: "", texto: "" });

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
      const response = await api.post("/ingresos", dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setMensaje({
          tipo: "success",
          texto: `¡Ingreso exitoso! Asigne al conductor el espacio #${response.data.data.espacioAsignado}`,
        });
        handleLimpiar();
        cargarCupos(); 
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

          {/* --- SECCIÓN DE LA CÁMARA (Reemplaza al input file) --- */}
          <div className="form-group" style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Lector Automático de Placas (IA) 📷
            </label>
            
            {!isCameraOpen ? (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setIsCameraOpen(true)}
                style={{ width: '100%', padding: '10px' }}
              >
                Abrir Cámara para Leer Placa
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
                />
                <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={captureAndScan}
                    disabled={isScanning}
                  >
                    {isScanning ? "Analizando... ⏳" : "Escanear Placa"}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setIsCameraOpen(false)}
                    disabled={isScanning}
                  >
                    Cerrar Cámara
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* --------------------------------------------------- */}

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
                  <option value="2">Campero</option>
                  <option value="3">Camioneta</option>
                  <option value="4">MicroBus</option>
                  <option value="5">Motocarro</option>
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
                  <option value="NIVEL 1">Nivel 1</option>
                  <option value="NIVEL 2">Nivel 2</option>
                  <option value="NIVEL 3">Nivel 3</option>
                  <option value="SUBTERRÁNEO">Subterráneo</option>
                </select>
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
              <button type="submit" className="btn-primary" disabled={isLoading || isScanning}>
                {isLoading ? "Guardando..." : "Registrar Ingreso"}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  handleLimpiar();
                  setMensaje({ tipo: "", texto: "" });
                }}
                disabled={isLoading || isScanning}
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