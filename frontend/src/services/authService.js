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
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, clave });

      if (response.data.status === 'success' && response.data.token) {
        const token = String(response.data.token || '').trim();
        if (token && token !== 'null' && token !== 'undefined') {
          localStorage.setItem('token', token);
        } else {
          throw new Error('Token inválido recibido del servidor');
        }

        if (response.data.data) {
          localStorage.setItem('usuario', JSON.stringify(response.data.data));
        }
      }

      return response.data;
    } catch (error) {
      console.error('authService.login error:', error);
      const message = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      throw new Error(message);
    }
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
