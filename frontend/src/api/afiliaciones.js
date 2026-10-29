import api from './client.js';

export const getAfiliaciones = () => api.get('/api/afiliaciones');
export const crearAfiliacion = (data) => api.post('/api/afiliaciones', data);
export const eliminarAfiliacion = (id) => api.delete(`/api/afiliaciones/${id}`);
export const actualizarAfiliacion = (id, data) => api.put(`/api/afiliaciones/${id}`, data);
