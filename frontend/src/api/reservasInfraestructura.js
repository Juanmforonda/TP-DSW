import axios from 'axios';

const api = axios.create({
  baseURL: '/',
});

export const getReservasInfraestructura = () => api.get('/api/reservasInfraestructura');
export const getReservasInfraestructuraPorEmbarcacion = (idEmbarcacion) =>
  api.get(`/api/reservasInfraestructura/embarcacion/${idEmbarcacion}`);
export const crearReservaInfraestructura = (data) => api.post('/api/reservasInfraestructura', data);
export const actualizarReservaInfraestructura = (id, data) =>
  api.put(`/api/reservasInfraestructura/${id}`, data);
export const cancelarReservaInfraestructura = (id) =>
  api.post(`/api/reservasInfraestructura/${id}/cancelar`);
export const finalizarReservaInfraestructura = (id) =>
  api.post(`/api/reservasInfraestructura/${id}/finalizar`);
export const eliminarReservaInfraestructura = (id) =>
  api.delete(`/api/reservasInfraestructura/${id}`);

