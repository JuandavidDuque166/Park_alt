import { useEffect, useState } from 'react'; 
import { Outlet, link, Navlink, usenavigate } from 'react-router-dom';
import { authservice } from '../services/authservice';
import { negocioservice } from '../services/negocioservice';
import { fiuser } from 'react-icons/fi';
import './layout.css';

export const Layout = () => {
    const [usuario, setUsuario] = useState(null);
    const [logoNegocio, setLogoNegocio] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
    cargarUsuario();
    cargarLogoNegocio();
    }, []);

    const cargarUsuario = () => {
    const user = authService.obtenerUsuario();
    setUsuario(user);
    console.log('Usuario cargado:', user);
    };

    const cargarLogoNegocio = async () => {
    try {
        const negocios = await negocioService.obtenerNegocios();
        if (negocios && negocios.length > 0 && negocios[0].logo_url) {
        setLogoNegocio(`http://localhost:3000${negocios[0].logo_url}`);
        }
    } catch (error) {
        console.error('Error al cargar logo del negocio:', error);
    }
    };

    const cerrarSesion = () => {
    authService.logout();
    navigate('/login');
    };

    return (
    <div className="layout-container">
        <header className="header">
        <div className="header-left">
          {/* Logo dinámico */}
            {!logoNegocio && <div className="logo"></div>}
            {logoNegocio &&  <img src={logoNegocio} alt="Logo" className="logo-img" /> }

            {usuario?.rol_nombre === 'Administrador' && (
            <h1>Panel Administrativo de Usuarios</h1>
            )}
            {usuario?.rol_nombre !== 'Administrador' && (
            <h1>Bienvenido, {usuario?.nombre}</h1>
            )}
        </div>

<div className="header-right">
    <Link to="/perfil" className="perfil-link">
    <FiUser />
    <span>Mi Perfil</span>
    </Link>
    <span className="user-name">{usuario?.nombre || 'Usuario'}</span>
    <span className="user-role">{usuario?.rol_nombre || 'Rol desconocido'}</span>
    <button className="logout-btn" onClick={cerrarSesion}>
    Cerrar Sesión
    </button>
</div>
</header>

{/* Navbar solo para administradores */}
{usuario?.rol_nombre === 'Administrador' && (
    <nav className="navbar">
    <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'active' : ''}>
        Usuarios
    </NavLink>
    <NavLink to="/roles" className={({ isActive }) => isActive ? 'active' : ''}>
        Roles
    </NavLink>
    <NavLink to="/permisos" className={({ isActive }) => isActive ? 'active' : ''}>
        Permisos
    </NavLink>
    <NavLink to="/negocio" className={({ isActive }) => isActive ? 'active' : ''}>
        Negocio
    </NavLink>
    </nav>
)}

<main className="content">
    <Outlet />
</main>
</div>
);
};
