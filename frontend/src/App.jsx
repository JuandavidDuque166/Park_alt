import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tarifas from './pages/tarifas';
import Mensualidades from './pages/Mensualidades';
import Perfil from './pages/Perfil';
import Permisos from './pages/Permisos';
import Usuarios from './pages/Usuarios';
import Roles from './pages/Roles';
import IngresoVehiculosOperario from './pages/IngresovehiculosOperario';
import Reportes from './pages/Reportes';
import DashboardLayout from './components/DashboardLayout';
import ControlParqueadero from './pages/ControlParqueadero';
import SalidaVehiculo from './pages/SalidaVehiculo';

// Nota: Asegúrate de tener importado PlaceholderPage si lo vas a usar en Tarifas
// import PlaceholderPage from './pages/PlaceholderPage'; 

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Ruta pública */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas (con Layout persistente) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/Dashboard" element={<Dashboard/>} />

            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/permisos" element={<Permisos />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/tarifas" element={<Tarifas />} />
            <Route path="/mensualidades" element={<Mensualidades />} />
            <Route path="/ingreso-vehiculos" element={<IngresoVehiculosOperario />} />
            <Route path="/salida-vehiculos" element={<SalidaVehiculo title="Salida Vehículos" description="Funcionalidad pendiente de implementación." />} />
            <Route path="/control-parqueadero" element={<ControlParqueadero title="Control Parqueadero" description="Funcionalidad pendiente de implementación." />} />
            <Route path="/reportes" element={<Reportes title="Reportes" description="Funcionalidad pendiente de implementación." />} />
          </Route>
        </Route>

        {/* Ruta no encontrada */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;