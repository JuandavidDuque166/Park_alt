import { api } from '../services/api';

export const rolesService = {
  async obtenerRoles() {
    const response = await api.get('/roles');
    return response.data.data;
  },

  async obtenerRolPorId(id) {
    const response = await api.get(`/roles/${id}`);
    return response.data.data;
  },

  async agregarRol(rol) {
    const response = await api.post('/roles', rol);
    return response.data.data;
  },

  async actualizarRol(id, rol) {
    const response = await api.put(`/roles/${id}`, rol);
    return response.data.data;
  },

  async eliminarRol(id) {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  async asignarPermisos(id, permisos) {
    const response = await api.put(`/roles/${id}/permisos`, { permissionsIDs: permisos });
    return response.data.data;
  },
};
