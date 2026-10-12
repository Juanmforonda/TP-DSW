import axios from 'axios';

const api = axios.create({
  baseURL: '/',
});

export const getAmarras = () => api.get('/api/amarras');
export const crearAmarra = (data) => api.post('/api/amarras', data);
export const eliminarAmarra = (id) => api.delete(`/api/amarras/${id}`);
export const actualizarAmarra = (id, data) => api.put(`/api/amarras/${id}`, data);