import axios from 'axios';

const API_URL = 'http://localhost:3000/api/permisos';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const permisosService = {
  async obtenerPermisos() {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data.data;
  },

  async agregarPermiso(permiso) {
    const response = await axios.post(API_URL, permiso, { headers: getAuthHeaders() });
    return response.data.data;
  },

  async actualizarPermiso(id, permiso) {
    const response = await axios.put(`${API_URL}/${id}`, permiso, { headers: getAuthHeaders() });
    return response.data;
  },

  async eliminarPermiso(id) {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    return response.data;
  }
};