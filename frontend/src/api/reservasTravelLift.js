import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/' });

export const getReservasTravelLift = (params = {}) =>
  api.get('/api/reservasTravelLift', { params });
export const getReservasTravelLiftPorSocio = (idSocio) =>
  api.get(`/api/reservasTravelLift/socio/${idSocio}`);
export const crearReservaTravelLift = (data) =>
  api.post('/api/reservasTravelLift', data);
export const actualizarReservaTravelLift = (id, data) =>
  api.put(`/api/reservasTravelLift/${id}`, data);
export const cancelarReservaTravelLift = (id) =>
  api.post(`/api/reservasTravelLift/${id}/cancelar`);
export const finalizarReservaTravelLift = (id) =>
  api.post(`/api/reservasTravelLift/${id}/finalizar`);
export const eliminarReservaTravelLift = (id) =>
  api.delete(`/api/reservasTravelLift/${id}`);
