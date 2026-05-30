import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';

import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardOperario from './pages/DashboardOperario';
import Perfil from './pages/Perfil';
import Permisos from './pages/Permisos';
import Usuarios from './pages/Usuarios';
import IngresoVehiculosOperario from './pages/IngresovehiculosOperario';
import PlaceholderPage from './pages/PlaceholderPage';
import DashboardLayout from './components/DashboardLayout';
import ControlParqueadero from './pages/ControlParqueadero';
import SalidaVehiculo from './pages/SalidaVehiculo';
import Mensualidades from './pages/Mensualidades';

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
            <Route path="/DashboardAdmin" element={<DashboardAdmin />} />
            <Route path="/DashboardOperario" element={<DashboardOperario />} />

            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/permisos" element={<Permisos />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/ingreso-vehiculos" element={<IngresoVehiculosOperario />} />
            <Route path="/salida-vehiculos" element={<SalidaVehiculo />} />
            <Route path="/control-parqueadero" element={<ControlParqueadero />} />
            <Route path="/tarifas" element={<PlaceholderPage title="Tarifas" description="Funcionalidad pendiente de implementación." />} />
            <Route path="/mensualidades" element={<Mensualidades title="Mensualidades" description="Funcionalidad pendiente de implementación." />} />
            <Route path="/reportes" element={<PlaceholderPage title="Reportes" description="Funcionalidad pendiente de implementación." />} />
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