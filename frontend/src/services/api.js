import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // <- viene del .env
  withCredentials: false,                // o true si usás cookies/sesión
  timeout: 20000
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

// Producción
export const postProduccion = data => api.post('/producciones', data);
export const getProducciones = (params = {}) => api.get('/producciones', { params }); // También corregido para consistencia

// Entregas - CORREGIDO para aceptar parámetros
export const getEntregas = (params = {}) => api.get('/entregas', { params });
export const postEntrega = data => api.post('/entregas', data);

// Nuevo endpoint para entregas masivas
export const postEntregaMasiva = data => api.post('/entregas/masiva', data);
export const getBeneficiariosCIC = (cicId) => api.get(`/entregas/beneficiarios-cic/${cicId}`);

export default api;