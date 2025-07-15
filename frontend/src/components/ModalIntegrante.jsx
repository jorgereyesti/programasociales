import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import '../pages/regBeneficiario.css';

export default function ModalIntegrante({ isOpen, onClose, onSave, initial }) {
    const { register, handleSubmit, reset } = useForm({
    defaultValues: initial || {
        nombre: '',
        dni: '',
        fecha_nac: '',
        escolaridad: '',
        vinculo: '',
        condicion: ''
        }
    });

    React.useEffect(() => {
    reset(initial || {
        nombre: '',
        dni: '',
        fecha_nac: '',
        escolaridad: '',
        vinculo: '',
        condicion: ''
    });
    }, [initial, reset]);

    if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h3>{initial ? 'Editar Integrante' : 'Agregar Integrante'}</h3>
        <form onSubmit={handleSubmit(onSave)}>
          <label>Nombre y Apellido</label>
          <input type="text" {...register('nombre', { required: true })} />

          <label>DNI</label>
          <input type="text" {...register('dni', { required: true })} />

          <label>Fecha de Nacimiento</label>
          <input type="date" {...register('fecha_nac', { required: true })} />

          <label>¿Cuenta con escolaridad?</label>
          <select {...register('escolaridad')}>
            <option value="">Seleccione...</option>
            <option value="Sí">Sí</option>
            <option value="No">No</option>
          </select>

          <label>Vínculo</label>
          <select {...register('vinculo')}>
            <option value="">Seleccione...</option>
            <option value="Esposo/a">Esposo/a</option>
            <option value="Hijo/a">Hijo/a</option>
            <option value="Abuelo/a">Abuelo/a</option>
            <option value="Tío/a">Tío/a</option>
            <option value="Sobrino/a">Sobrino/a</option>
            <option value="Otro">Otro</option>
          </select>

          <label>Condición</label>
          <select {...register('condicion')}>
            <option value="">Seleccione...</option>
            <option value="Adulto Mayor">Adulto Mayor</option>
            <option value="Discapacidad">Discapacidad</option>
            <option value="Menor de Edad">Menor de Edad</option>
            <option value="No especifica">No especifica</option>
          </select>

          <button className="btn" type="submit">
            {initial ? 'Guardar Cambios' : 'Guardar Integrante'}
          </button>
        </form>
      </div>
    </div>
  );
}

ModalIntegrante.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initial: PropTypes.shape({
    nombre: PropTypes.string,
    dni: PropTypes.string,
    fecha_nac: PropTypes.string,
    escolaridad: PropTypes.string,
    vinculo: PropTypes.string,
    condicion: PropTypes.string
  })
};
