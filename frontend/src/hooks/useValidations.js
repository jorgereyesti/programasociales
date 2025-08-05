import { useState, useCallback } from 'react';

export const useValidations = () => {
  const [errors, setErrors] = useState({});

  // Validar DNI argentino
  const validateDNI = useCallback((dni, fieldName = 'dni') => {
    if (!dni) {
      setErrors(prev => ({ ...prev, [fieldName]: 'El DNI es requerido' }));
      return false;
    }
    
    if (!/^\d{7,8}$/.test(dni)) {
      setErrors(prev => ({ ...prev, [fieldName]: 'El DNI debe tener entre 7 y 8 dígitos' }));
      return false;
    }
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    return true;
  }, []);

  // Validar teléfono
  const validatePhone = useCallback((phone, fieldName = 'telefono') => {
    if (!phone) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true; // Es opcional
    }
    
    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^(\+54)?(\d{2,4})?\d{6,8}$/.test(cleanPhone)) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Formato de teléfono inválido' }));
      return false;
    }
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    return true;
  }, []);

  // Validar fecha no futura
  const validateNotFutureDate = useCallback((date, fieldName = 'fecha') => {
    if (!date) {
      setErrors(prev => ({ ...prev, [fieldName]: 'La fecha es requerida' }));
      return false;
    }
    
    if (new Date(date) > new Date()) {
      setErrors(prev => ({ ...prev, [fieldName]: 'La fecha no puede ser futura' }));
      return false;
    }
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    return true;
  }, []);

  // Validar edad según condición
  const validateAgeCondition = useCallback((birthDate, condition, fieldName = 'condicion') => {
    if (!birthDate || !condition) return true;
    
    const age = calculateAge(birthDate);
    
    if (condition === 'Menor de Edad' && age >= 18) {
      setErrors(prev => ({ 
        ...prev, 
        [fieldName]: `La persona tiene ${age} años y no puede ser registrada como Menor de Edad` 
      }));
      return false;
    }
    
    if (condition === 'Adulto Mayor' && age < 60) {
      setErrors(prev => ({ 
        ...prev, 
        [fieldName]: `La persona tiene ${age} años y no puede ser registrada como Adulto Mayor` 
      }));
      return false;
    }
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    return true;
  }, []);

  // Validar cantidad positiva
  const validatePositiveNumber = useCallback((number, fieldName = 'cantidad') => {
    if (!number || number <= 0) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Debe ser un número mayor a 0' }));
      return false;
    }
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    return true;
  }, []);

  // Limpiar errores
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Limpiar error específico
  const clearError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Agregar error manual
  const addError = useCallback((fieldName, message) => {
    setErrors(prev => ({ ...prev, [fieldName]: message }));
  }, []);

  return {
    errors,
    validateDNI,
    validatePhone,
    validateNotFutureDate,
    validateAgeCondition,
    validatePositiveNumber,
    clearErrors,
    clearError,
    addError,
    hasErrors: Object.keys(errors).length > 0
  };
};

// Función auxiliar para calcular edad
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}