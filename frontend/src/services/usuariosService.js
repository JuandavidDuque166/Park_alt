import { api } from './api';

export const usuariosService = {
  async obtenerUsuarios() {
    const response = await api.get('/users');
    return response.data.data;
  },

  async agregarUsuario(usuario) {
    const response = await api.post('/users', usuario);
    return response.data.data;
  },

  async actualizarUsuario(id, usuario) {
    const response = await api.put(`/users/${id}`, usuario);
    return response.data;
  },

  async eliminarUsuario(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};