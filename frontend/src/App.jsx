import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
<<<<<<< Updated upstream
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Inicio } from './pages/Inicio';
import { Usuarios } from './pages/Usuarios';
import { Roles } from './pages/Roles';
import { Permisos } from './pages/Permisos';
import { Negocio } from './pages/Negocio';
import { Perfil } from './pages/Perfil';
=======
import Login from './pages/Login';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardOperario from './pages/DashboardOperario';
import Ingresovehiculos from './pages/IngresovehiculosOperario';
import SalidaVehiculos from './pages/SalidaVehiculos';
import Perfil from './pages/Perfil';
import Permisos from './pages/Permisos';
import Usuarios from './pages/Usuarios';
import Roles from './pages/Roles';

>>>>>>> Stashed changes
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

<<<<<<< Updated upstream
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/inicio" element={<Inicio />} />
=======
        {/* Rutas protegidas: aquí es donde entra la magia */}
        <Route element={<ProtectedRoute />}>
          <Route path="/DashboardAdmin" element={<DashboardAdmin />} />
          <Route path="/DashboardOperario" element={<DashboardOperario />} />
>>>>>>> Stashed changes
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/permisos" element={<Permisos />} />
          <Route path="/negocio" element={<Negocio />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;