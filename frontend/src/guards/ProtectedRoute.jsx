import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
    // Obtenemos los valores directamente del almacenamiento local
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    
    // Rastreo: esto aparecerá en tu consola F12
    console.log("DEBUG PROTECTED - Token encontrado:", !!token);
    console.log("DEBUG PROTECTED - Usuario encontrado:", !!usuario);

    // Validación estricta
    if (!token || !usuario) {
        console.log("REDIRECCIONANDO AL LOGIN: Faltan credenciales en LocalStorage");
        return <Navigate to="/login" replace />;
    }

    // Si todo está bien, dejamos pasar al usuario a sus rutas
    return <Outlet />;
};