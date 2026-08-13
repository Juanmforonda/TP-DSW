import axios from 'axios';

const api = axios.create({
  baseURL: '/', 
});

export const getCuotas= () => api.get('/api/cuotasMensuales');
export const eliminarCuota = (id) => api.delete(`/api/cuotasMensuales/${id}`);
export const actualizarCuota = (id, data) => api.put(`/api/cuotasMensuales/${id}`, data);
export const getCuotasPorSocio = (idSocio) =>api.get(`/api/cuotasMensuales/socio/${idSocio}`);
export const registrarPagoCuota = (id, data) => api.post(`/api/cuotasMensuales/${id}/pago`, data);
export const generarCuotas = (mes, anio) => api.post('/api/cuotasMensuales/generar', { mes, anio });
export const crearPreferenciaMP = (idCuota) => api.post(`/api/cuotasMensuales/${idCuota}/mercadopago/preferencia`);
export const confirmarPagoMP = (paymentId) => api.post('/api/cuotasMensuales/mercadopago/confirmar', { paymentId });

