import { Navigate } from "react-router-dom";
import {authService} from "../services/authService";

export const ProtectedRoute = ({ children }) => {
    const usuario = authService.obtenerUsuario();

    if (!authService.estaAutenticado() || !usuario) {
        authService.logout();
        return <Navigate to="/login" replace />;
    }

    return children;
};
