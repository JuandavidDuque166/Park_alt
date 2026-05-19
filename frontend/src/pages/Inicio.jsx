import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { RiShieldLine } from 'react-icons/ri';
import { FiCheck, FiSettings, FiUser } from 'react-icons/fi';
import './Inicio.css';

export const Inicio = () => {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        const user = authService.obtenerUsuario();
        setUsuario(user);
    }, []);

    return (
        <div className="inicio-container">
            <div className="welcome-card">
                <div className="welcome-header">
                    <div className="avatar">
                        {usuario?.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div className="welcome-text">
                        <h2>Bienvenido, {usuario?.nombre}</h2>
                        <p className="rol-badge">{usuario?.rol_nombre || usuario?.rol}</p>
                    </div>
                </div>

                {usuario?.permisos && usuario.permisos.length > 0 && (
                    <div className="info-section">
                        <h3>
                            <RiShieldLine /> Tus Permisos
                        </h3>
                        <div className="permisos-grid">
                            {usuario.permisos.map((permiso, index) => (
                                <div key={index} className="permiso-badge">
                                    <FiCheck />
                                    {permiso}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="quick-actions">
                    <h3>
                        <FiSettings /> Acciones Rápidas
                    </h3>
                    <Link to="/perfil" className="action-btn">
                        <FiUser />
                        <span>Mi Perfil</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};