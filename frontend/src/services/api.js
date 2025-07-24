import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

// Catálogos
export const getCIC = () => api.get('/cic');
export const getCondicionesFamiliar = () => api.get('/condiciones-familiar');
export const getMantenimientosEconomico = () => api.get('/mantenimientos-economico');
export const getProductos = () => api.get('/productos');
export const getDashboardStats = () => api.get('/dashboard');

// Programa social
export const postRegistro = data => api.post('/registro', data);
export const getBeneficiarios = (params = {}) =>  api.get('/beneficiarios', { params });
export const getFamiliares = () => api.get('/familiares');

// Actualizar y eliminar beneficiario (registro)
export const putBeneficiario = (id, data) =>
  api.put(`/registro/${id}`, data);
export const deleteBeneficiario = (id) =>
  api.delete(`/registro/${id}`);

// Producción y entrega
export const postProduccion = data => api.post('/produccion', data);
export const getProduccion = () => api.get('/produccion');
export const postEntrega = data => api.post('/entrega', data);
export const getEntregas = () => api.get('/entrega');

export default api;
