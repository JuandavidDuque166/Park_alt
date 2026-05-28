import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';
import './DashboardLayout.css';

const Sidebar = ({ role }) => {
    const navigate = useNavigate();
    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const currentRole = role ? role.toUpperCase() : 'NULO';

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="brand">
                    <span className="brand-icon">🚘</span>
                    <div>
                        <h2>Sistema Parqueadero</h2>
                        <p>{role || 'Usuario'}</p>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to={currentRole === 'ADMINISTRADOR' ? '/DashboardAdmin' : '/DashboardOperario'} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <p>🏠 Inicio</p>
                </NavLink>

                {/* MENÚ OPERARIO: Incluye acceso a Control y Mensualidades */}
                {currentRole === 'OPERARIO' && (
                    <>
                        <NavLink to="/ingreso-vehiculos" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <p>➔ Ingreso Vehículos</p>
                        </NavLink>
                        <NavLink to="/salida-vehiculos" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <p>➔ Salida Vehículos</p>
                        </NavLink>
                        <NavLink to="/control-parqueadero" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <p>🅿️ Control Parqueadero</p>
                        </NavLink>
                        <NavLink to="/mensualidades" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <p>💳 Mensualidades</p>
                        </NavLink>
                    </>
                )}

                {/* MENÚ ADMINISTRADOR */}
                {currentRole === 'ADMINISTRADOR' && (
                    <>
                        <NavLink to="/control-parqueadero" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <p>🅿️ Control Parqueadero</p>
                        </NavLink>
                        <NavLink to="/tarifas" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <p>💲 Tarifas</p>
                        </NavLink>
                        <NavLink to="/mensualidades" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <p>📅 Mensualidades</p>
                        </NavLink>
                        <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <p>👥 Usuarios</p>
                        </NavLink>
                        <NavLink to="/reportes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                            <p>📊 Reportes</p>
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <p className="role-text">{role || 'Usuario'}</p>
                    <p className="name-text">{authService.obtenerUsuario()?.nombre || 'Usuario'}</p>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                    ↪️ Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

const DashboardLayout = () => {
    const usuario = authService.obtenerUsuario();
    const role = usuario?.rol_nombre; 

    return (
        <div className="dashboard-layout">
            <Sidebar role={role} />
            <main className="dashboard-main">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;