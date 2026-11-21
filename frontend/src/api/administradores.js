import api from './client.js';

export const getAdministradores = () => api.get('/api/administradores');
export const getMiPerfilAdministrador = () =>
  api.get('/api/administradores/me');
export const crearAdministrador = (data) => api.post('/api/administradores', data);
export const eliminarAdministrador = (id) => api.delete(`/api/administradores/${id}`);
export const actualizarAdministrador = (id, data) => api.put(`/api/administradores/${id}`, data);
export const actualizarMiPerfilAdministrador = (data) =>
  api.put('/api/administradores/me', data);
export const cambiarMiPasswordAdministrador = (data) =>
  api.patch('/api/administradores/me/password', data);
