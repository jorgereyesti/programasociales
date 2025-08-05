import React from 'react';
import PropTypes from 'prop-types';
import './ValidationFeedback.css';

export default function ValidationFeedback({ errors }) {
  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <div className="validation-feedback">
      <div className="validation-header">
        <span className="validation-icon">⚠️</span>
        <h4>Se encontraron los siguientes errores:</h4>
      </div>
      <ul className="validation-list">
        {Object.entries(errors).map(([field, message]) => (
          <li key={field} className="validation-item">
            <span className="field-name">{formatFieldName(field)}:</span>
            <span className="error-message">{message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

ValidationFeedback.propTypes = {
  errors: PropTypes.object
};

// Función para formatear nombres de campos
function formatFieldName(field) {
  const fieldNames = {
    dni: 'DNI',
    telefono: 'Teléfono',
    fecha_relevamiento: 'Fecha de relevamiento',
    fecha_entrega: 'Fecha de entrega',
    cantidad: 'Cantidad',
    beneficiario_id: 'Beneficiario',
    producto_id: 'Producto',
    cic_id: 'CIC'
  };
  
  return fieldNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
}