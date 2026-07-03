import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cupos, setCupos] = useState({ disponibles: 0, total: 0 });
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

  const webcamRef = useRef(null);

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

  const [vehicularMensualidad, setVehicularMensualidad] = useState(null);
  const [camposBloqueados, setCamposBloqueados] = useState({ idTipo: false, nivel: false });

  // ESCUDO 1: Bloquea físicamente las teclas de símbolos antes de que se pinten en pantalla
  const handleKeyDownPlaca = (e) => {
    const teclasPermitidas = ["Backspace", "Tab", "Enter", "ArrowLeft", "ArrowRight", "Delete"];
    if (teclasPermitidas.includes(e.key)) return;

    // Solo permite letras (A-Z, a-z) y números (0-9)
    const regexAlfanumerico = /^[A-Za-z0-9]$/;
    if (!regexAlfanumerico.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const nuevoValor = name === "placa" ? value.toUpperCase() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nuevoValor,
    }));

    if (name === 'placa' && nuevoValor.trim().length >= 4) {
      try {
        const response = await api.get(`/mensualidades/verificar/${encodeURIComponent(nuevoValor.trim())}`);
        if (response.data.success && response.data.tieneMensualidad) {
          setVehicularMensualidad(response.data);
          setFormData((prev) => ({
            ...prev,
            idTipo: String(response.data.id_tipo || response.data.idTipo || response.data.id_tipo_vehiculo || ""),
            nivel: response.data.nivel_servicio || prev.nivel,
          }));
          setCamposBloqueados({ idTipo: true, nivel: true });
          setMensaje({ tipo: 'success', texto: 'Vehículo con mensualidad activa. Campos completados automáticamente.' });
        } else {
          setVehicularMensualidad(null);
          setCamposBloqueados({ idTipo: false, nivel: false });
        }
      } catch (error) {
        console.error('Error verificando mensualidad:', error);
      }
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  };

  const captureAndScan = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const imageFile = dataURLtoFile(imageSrc, 'placa_capturada.jpg');
    setFormData(prev => ({ ...prev, foto: imageFile }));

    setIsScanning(true);
    setMensaje({ tipo: "", texto: "" });

    try {
      const dataToScan = new FormData();
      dataToScan.append("imagen", imageFile); 
      const response = await api.post("/ingresos/leer-placa", dataToScan, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success && response.data.placa) {
        // Limpieza preventiva sobre el resultado de la IA
        const placaDetectada = response.data.placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        setFormData(prev => ({ ...prev, placa: placaDetectada }));
        setMensaje({ tipo: "success", texto: "¡Placa detectada y autocompletada por IA!" });
        setIsCameraOpen(false);

        // Disparar verificación de mensualidad con la placa limpia
        handleInputChange({ target: { name: 'placa', value: placaDetectada } });
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
    setVehicularMensualidad(null);
    setCamposBloqueados({ idTipo: false, nivel: false });
    setIsCameraOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje({ tipo: "", texto: "" });

    if (!formData.placa || !formData.idTipo || !formData.nivel) {
      setMensaje({ tipo: "error", texto: "Por favor, complete todos los campos obligatorios." });
      setIsLoading(false);
      return;
    }

    const placaLimpia = formData.placa.trim().toUpperCase();

    // ==========================================
    // ESCUDO 3: VALIDACIONES SEGÚN EL VEHÍCULO
    // ==========================================
    if (formData.idTipo === "7") {
      // --- VALIDACIÓN PARA BICICLETAS ---
      if (placaLimpia.length < 10 || placaLimpia.length > 12) {
        setMensaje({ 
          tipo: "error", 
          texto: `La placa de bicicleta debe tener entre 10 y 12 caracteres (Actual: ${placaLimpia.length}).` 
        });
        setIsLoading(false);
        return;
      }
    } else {
      // --- VALIDACIÓN PARA VEHÍCULOS NORMALES ---
      if (placaLimpia.length < 5) {
        setMensaje({ tipo: "error", texto: "La placa del vehículo debe tener mínimo 5 caracteres." });
        setIsLoading(false);
        return;
      }

      const regexAAA12 = /^[A-Z]{3}[0-9]{2}$/;
      const regexAAA123 = /^[A-Z]{3}[0-9]{3}$/;
      const regexAAA12A = /^[A-Z]{3}[0-9]{2}[A-Z]$/;

      const esFormatoValido = regexAAA12.test(placaLimpia) || 
                              regexAAA123.test(placaLinter) || 
                              regexAAA123.test(placaLimpia) || 
                              regexAAA12A.test(placaLimpia);

      if (!esFormatoValido) {
        setMensaje({ 
          tipo: "error", 
          texto: "Formato de placa inválido. Ejemplos permitidos: AAA12, AAA123 o AAA12A." 
        });
        setIsLoading(false);
        return;
      }
    }

    // ==========================================
    // ENVÍO DE DATOS
    // ==========================================
    const dataToSend = new FormData();
    dataToSend.append("placa", placaLimpia);
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
          texto: `¡Ingreso exitoso! Asigne al conductor el espacio #${response.data.data?.espacioAsignado || 'Asignado'}`,
        });
        handleLimpiar();
        cargarCupos();
        window.dispatchEvent(new Event("actualizar_datos_parqueadero"));
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "Ocurrió un error al registrar el ingreso.";
      setMensaje({ tipo: "error", texto: errorMsg });
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
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Placa *</label>
                <input 
                  type="text" 
                  name="placa" 
                  placeholder={formData.idTipo === "7" ? "BICICLETA123" : "ABC123"} 
                  value={formData.placa} 
                  onKeyDown={handleKeyDownPlaca} // ESCUDO 1: Bloqueo de teclado físico
                  onChange={(e) => {
                    // ESCUDO 2: Limpieza inmediata por si intentan pegar símbolos con mouse
                    e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, "");
                    handleInputChange(e);
                  }} 
                  maxLength={formData.idTipo === "7" ? 12 : 6} // MaxLength Dinámico
                  required 
                />
              </div>
              <div className="form-group">
                <label>Tipo de Vehículo *</label>
                <select 
                  name="idTipo" 
                  value={formData.idTipo} 
                  onChange={handleInputChange} 
                  onClick={(e) => camposBloqueados.idTipo && e.preventDefault()}
                  required 
                  className={camposBloqueados.idTipo ? "input-blocked" : ""}
                  style={camposBloqueados.idTipo ? { backgroundColor: '#eef2f3', cursor: 'not-allowed' } : {}}
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
                  onClick={(e) => camposBloqueados.nivel && e.preventDefault()}
                  required 
                  className={camposBloqueados.nivel ? "input-blocked" : ""}
                  style={camposBloqueados.nivel ? { backgroundColor: '#eef2f3', cursor: 'not-allowed' } : {}}
                >
                  <option value="">Seleccione</option>
                  <option value="Nivel 1">Nivel 1</option>
                  <option value="Nivel 2">Nivel 2</option>
                  <option value="Nivel 3">Nivel 3</option>
                  <option value="Subterráneo">Subterráneo</option>
                </select>
              </div>
            </div>
            <div className="info-box">
              <p><strong>Fecha y hora:</strong> Se registrarán automáticamente al ingresar.</p>
              <p><strong>Operario en turno:</strong> {usuarioActual?.nombre || "Cargando..."}</p>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={isLoading || isScanning}>
                {isLoading ? "Guardando..." : "Registrar Ingreso"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => { handleLimpiar(); setMensaje({ tipo: "", texto: "" }); }} disabled={isLoading || isScanning}>
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