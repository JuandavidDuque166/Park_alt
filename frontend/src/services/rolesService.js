import { api } from '../services/api';

export const rolesService = {
  async obtenerRoles() {
    return getData(await api.get('/roles'));
  },

  async obtenerRolPorId(id) {
    return getData(await api.get(`/roles/${id}`));
  },

  async agregarRol(rol) {
    return getData(await api.post('/roles', rol));
  },

  async actualizarRol(id, rol) {
    return getData(await api.put(`/roles/${id}`, rol));
  },

  async eliminarRol(id) {
    return getData(await api.delete(`/roles/${id}`));
  },

  async asignarPermisos(id, permisos) {
    return getData(await api.put(`/roles/${id}/permisos`, { permissionsIDs: permisos }));
  },
};
