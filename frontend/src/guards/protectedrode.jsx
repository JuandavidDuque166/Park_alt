import { navigate } from 'react-router-dom';
import { authservice } from '../services/authservice';

export const protectedroute = ({ Children}) => {
    if (!authservice.estaAutenticado()) {
        return <Navigate to="/login" replace />
    }

    return Children;
};
