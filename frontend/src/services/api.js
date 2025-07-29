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
export const getBeneficiarios = (params = {}) => api.get('/beneficiarios', { params });
export const getFamiliares = () => api.get('/familiares');

// Obtener un beneficiario específico con sus familiares
export const getBeneficiario = (id) => api.get(`/beneficiarios/${id}`);

// Actualizar y eliminar beneficiario (registro)
export const putBeneficiario = (id, data) => api.put(`/beneficiarios/${id}`, data);
export const updateBeneficiario = (id, data) => api.put(`/beneficiarios/${id}`, data); // Alias para consistency
export const deleteBeneficiario = (id) => api.delete(`/beneficiarios/${id}`);

// Producción y entrega
export const postProduccion = data => api.post('/producciones', data);
export const getProducciones = () => api.get('/producciones');
export const postEntrega = data => api.post('/entregas', data);
export const getEntregas = () => api.get('/entregas');

export default api;