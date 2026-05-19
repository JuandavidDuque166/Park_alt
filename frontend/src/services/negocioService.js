import axios from 'axios';

const API_URL = 'http://localhost:3000/api/negocios';
const UPLOAD_URL = 'http://localhost:3000/api/upload';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const negocioService = {
  async obtenerNegocios() {
    const response = await axios.get(API_URL, { headers: getAuthHeaders() });
    return response.data.data;
  },

  async obtenerNegocioPorId(id) {
    const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    return response.data.data;
  },

  async agregarNegocio(negocio) {
    const response = await axios.post(API_URL, negocio, { headers: getAuthHeaders() });
    return response.data.data;
  },

  async actualizarNegocio(id, negocio) {
    const response = await axios.put(`${API_URL}/${id}`, negocio, { headers: getAuthHeaders() });
    return response.data;
  },

  async subirImagen(archivo) {
    const formData = new FormData();
    formData.append('image', archivo);

    const response = await axios.post(`${UPLOAD_URL}/image`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  }
};