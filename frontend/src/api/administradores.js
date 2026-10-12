import axios from 'axios';

const api = axios.create({
  baseURL: '/', 
});

export const getAdministradores = () => api.get('./api/administradores');
export const crearAdministrador = (data) => api.post('./api/administradores', data);
export const eliminarAdministrador = (id) => api.delete(`./api/administradores/${id}`);
export const actualizarAdministrador = (id, data) => api.put(`./api/administradores/${id}`, data);
