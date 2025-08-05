import api from './api';

export const validationService = {
  // Verificar si un DNI ya existe
  async checkDNIExists(dni, excludeId = null) {
    try {
      const params = { dni };
      if (excludeId) params.excludeId = excludeId;
      
      const response = await api.get('/beneficiarios/check-dni', { params });
      return response.data;
    } catch (error) {
      console.error('Error verificando DNI:', error);
      throw error;
    }
  },

  // Verificar límite de entregas diarias
  async checkDailyDeliveryLimit(beneficiarioId, fecha) {
    try {
      const response = await api.get('/entregas/check-limit', {
        params: { beneficiario_id: beneficiarioId, fecha }
      });
      return response.data;
    } catch (error) {
      console.error('Error verificando límite de entregas:', error);
      throw error;
    }
  },

  // Verificar stock disponible
  async checkProductStock(productoId, cantidad) {
    try {
      const response = await api.get('/productos/check-stock', {
        params: { producto_id: productoId, cantidad }
      });
      return response.data;
    } catch (error) {
      console.error('Error verificando stock:', error);
      throw error;
    }
  }
};

// Hook para validación asíncrona con debounce
import { useState, useCallback, useRef } from 'react';

export const useAsyncValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [asyncErrors, setAsyncErrors] = useState({});
  const debounceTimers = useRef({});

  const validateDNIAsync = useCallback(async (dni, excludeId = null) => {
    // Limpiar timer anterior si existe
    if (debounceTimers.current.dni) {
      clearTimeout(debounceTimers.current.dni);
    }

    // Debounce de 500ms
    debounceTimers.current.dni = setTimeout(async () => {
      if (!dni || dni.length < 7) return;

      setIsValidating(true);
      try {
        const result = await validationService.checkDNIExists(dni, excludeId);
        
        if (result.exists) {
          setAsyncErrors(prev => ({
            ...prev,
            dni: `DNI ya registrado para ${result.beneficiario.nombre}`
          }));
        } else {
          setAsyncErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.dni;
            return newErrors;
          });
        }
      } catch (error) {
        console.error('Error en validación asíncrona:', error);
      } finally {
        setIsValidating(false);
      }
    }, 500);
  }, []);

  const clearAsyncErrors = useCallback(() => {
    setAsyncErrors({});
  }, []);

  return {
    isValidating,
    asyncErrors,
    validateDNIAsync,
    clearAsyncErrors
  };
};