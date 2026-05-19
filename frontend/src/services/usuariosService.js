import axios from 'axios';

const API_URL = 'http://localhost:3000/api/users';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const usuariosService = {
  async obtenerUsuarios() {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data.data;
  },

  async agregarUsuario(usuario) {
    const response = await axios.post(API_URL, usuario, { headers: getAuthHeaders() });
    return response.data.data;
  },

  async actualizarUsuario(id, usuario) {
    const response = await axios.put(`${API_URL}/${id}`, usuario, { headers: getAuthHeaders() });
    return response.data;
  },

  async eliminarUsuario(id) {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    return response.data;
  }
};