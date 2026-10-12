import axios from 'axios';

const api = axios.create({
  baseURL: '/', 
});

export const getSocios = () => api.get('./api/socios');
export const crearSocio = (data) => api.post('./api/socios', data);
export const bajaLogicaSocio = (id) => api.put(`./api/socios/baja-logica/${id}`);
export const eliminarSocio = (id) => api.delete(`./api/socios/${id}`);
export const actualizarSocio = (id, data) => api.put(`./api/socios/${id}`, data);
