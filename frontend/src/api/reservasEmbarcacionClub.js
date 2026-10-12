import axios from "axios";

const api = axios.create({
  baseURL: "/",
});

export const getReservasEmbarcacionClub = () => api.get("/api/reservasEmbarcacionClub");
export const crearReservaEmbarcacionClub = (data) =>
  api.post("/api/reservasEmbarcacionClub", data);
export const eliminarReservaEmbarcacionClub = (id) =>
  api.delete(`/api/reservasEmbarcacionClub/${id}`);
export const actualizarReservaEmbarcacionClub = (id, data) =>
  api.put(`/api/reservasEmbarcacionClub/${id}`, data);
export const cancelarReservaEmbarcacionClub = (id) =>
  api.post(`/api/reservasEmbarcacionClub/${id}/cancelar`);
export const finalizarReservaEmbarcacionClub = (id) =>
  api.post(`/api/reservasEmbarcacionClub/${id}/finalizar`);
export const getReservasPorSocio = (idSocio) =>
  api.get(`/api/reservasEmbarcacionClub/socio/${idSocio}`);
export const getReservasPorEmbarcacion = (idEmbarcacion) =>
  api.get(`/api/reservasEmbarcacionClub/embarcacion/${idEmbarcacion}`);