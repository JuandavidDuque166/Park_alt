import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Login.css';

export const Login = () => {
    const [formData, setFormData] = useState({ email: '', clave: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            console.log('Intentando login...', formData);

            const response = await authService.login(
                formData.email,
                formData.clave
            );

            console.log('RESPUESTA LOGIN:', response);

            if (response.status === 'success') {

                console.log("RESPUESTA COMPLETA:", response);

                const rol = response.data?.rol;

                console.log("ROL DETECTADO:", rol);

                if (rol === 1 || rol === 'admin') {
                    navigate('/Dashboard');
                } 
                else if (rol === 2 || rol === 'operario') {
                    navigate('/DashboardOperario');
                } 
                else {
                    setError('Rol no reconocido');
                }

            } else {
                setError(response.message || 'No se pudo iniciar sesión');
            }

        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setError(error.message || 'Credenciales incorrectas');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Sistema de Parqueadero</h2>
                    <p>Gestión en altura y subterráneo</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    
                    <div className="form-group">
                        <label htmlFor="email">Usuario</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Ingrese su usuario"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="clave">Contraseña</label>
                        <input
                            type="password"
                            id="clave"
                            name="clave"
                            placeholder="Ingrese su contraseña"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-login">
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;