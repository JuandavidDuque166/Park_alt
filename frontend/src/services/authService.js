import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Configurar axios para incluir el token automáticamente
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authService = {
  // Login
  async login(email, clave) {
    const response = await axios.post(`${API_URL}/auth/login`, { email, clave });
    if (response.data.status === 'success' && response.data.token) {
      localStorage.setItem('token', response.data.token);
      // Guardar datos del usuario directamente desde la respuesta del login
      if (response.data.data) {
        localStorage.setItem('usuario', JSON.stringify(response.data.data));
      }
    }
    return response.data;
  },

  // Obtener usuario desde localStorage
  obtenerUsuario() {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) {
      return null;
    }

    try {
      return JSON.parse(usuarioStr);
    } catch (error) {
      console.error('Usuario guardado inválido:', error);
      this.logout();
      return null;
    }
  },

  // Verificar si está autenticado
  estaAutenticado() {
    return !!localStorage.getItem('token');
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
};
