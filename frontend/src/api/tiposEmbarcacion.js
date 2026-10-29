import api from './client.js';

export const getTiposEmbarcacion= () => api.get('/api/tiposEmbarcacion');
export const crearTipoEmbarcacion= (data) => api.post ('/api/tiposEmbarcacion', data);
export const eliminarTipoEmbarcacion = (id) => api.delete(`/api/tiposEmbarcacion/${id}`);
export const actualizarTipoEmbarcacion = (id, data) => api.put(`/api/tiposEmbarcacion/${id}`, data);
export const getTipoEmbarcacionPorSocio = (idSocio) =>
  api.get(`/api/tiposEmbarcacion/socio/${idSocio}`);
