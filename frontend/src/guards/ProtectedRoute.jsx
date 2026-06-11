import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
    // Obtenemos los valores directamente del almacenamiento local
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    const tokenValido = token && token !== 'null' && token !== 'undefined';

    // Rastreo: esto aparecerá en tu consola F12
    console.log("DEBUG PROTECTED - Token encontrado:", !!tokenValido);
    console.log("DEBUG PROTECTED - Usuario encontrado:", !!usuario);

    if (!tokenValido || !usuario) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        console.log("REDIRECCIONANDO AL LOGIN: Faltan credenciales válidas en LocalStorage");
        return <Navigate to="/login" replace />;
    }

    // Si todo está bien, dejamos pasar al usuario a sus rutas
    return <Outlet />;
};