import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { Login } from './pages/Login';
import  Dashboard  from './pages/Dashboard';
import { Usuarios } from './pages/Usuarios';
import { Roles } from './pages/Roles';
import { Permisos } from './pages/Permisos';
import { Negocio } from './pages/Negocio';
import { Perfil } from './pages/Perfil';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
        >
          <Route path="/inicio" element={<Dashboard />} />
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
