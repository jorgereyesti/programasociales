// src/components/ValidatedInput.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './ValidatedInput.css';

export default function ValidatedInput({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  maxLength,
  pattern,
  helpText,
  ...props
}) {
  const [touched, setTouched] = useState(false);
  const showError = touched && error;

  const handleBlur = (e) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };

  return (
    <div className={`validated-input-container ${showError ? 'has-error' : ''}`}>
      {label && (
        <label className="validated-input-label">
          {label}
          {required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        <input
          type={type}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          pattern={pattern}
          className={`validated-input ${showError ? 'input-error' : ''}`}
          {...props}
        />
        
        {showError && (
          <span className="error-icon" title={error}>❌</span>
        )}
        
        {!showError && touched && value && (
          <span className="success-icon" title="Válido">✅</span>
        )}
      </div>
      
      {helpText && !showError && (
        <small className="help-text">{helpText}</small>
      )}
      
      {showError && (
        <small className="error-text">{error}</small>
      )}
    </div>
  );
}

ValidatedInput.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  pattern: PropTypes.string,
  helpText: PropTypes.string
};

