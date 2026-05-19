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
            const response = await authService.login(formData.email, formData.clave);
            console.log('Login exitoso:', response);
            navigate('/inicio');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setError(error.response?.data?.message || 'Credenciales incorrectas');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Iniciar Sesión</h2>
                    <p>Sistema de Gestión</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="clave">Contraseña</label>
                        <input
                            type="password"
                            id="clave"
                            name="clave"
                            value={formData.clave}
                            onChange={handleChange}
                            required
                            placeholder="Tu contraseña"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn-login">
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
};