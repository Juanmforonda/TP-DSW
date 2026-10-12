import axios from 'axios';

const api = axios.create({
  baseURL: '/',
});

export const getBoxes = () => api.get('/api/boxes');
export const crearBox = (boxData) => api.post('/api/boxes', boxData);
export const eliminarBox = (id) => api.delete(`/api/boxes/${id}`);
export const actualizarBox = (id, boxData) => api.put(`/api/boxes/${id}`, boxData);