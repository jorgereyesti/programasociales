// src/pages/RegistroPage.jsx - Versión con validaciones
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCIC,
  getCondicionesFamiliar,
  getMantenimientosEconomico,
  postRegistro,
  getBeneficiario,
  putBeneficiario
} from '../services/api';
import ModalIntegrante from '../components/ModalIntegrante';
import ValidatedInput from '../components/ValidatedInput';
import ValidationFeedback from '../components/ValidationFeedback';
import { useValidations } from '../hooks/useValidations';
import '../App.css';
import '../index.css';
import './regBeneficiario.css';

export default function RegistroPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors: formErrors }
  } = useForm({
    defaultValues: {
      fecha_relevamiento: '',
      cic: '',
      nombre: '',
      dni: '',
      telefono: '',
      direccion: '',
      lena_social: '',
      actividades_cic: '',
      ingresos_formales: '',
      huerta: '',
      mantenimiento_economico: '',
      observaciones: '',
      integrantes: []
    }
  });

  const { fields, append, update, remove } = useFieldArray({
    name: 'integrantes',
    control
  });

  // Hook de validaciones
  const {
    errors: validationErrors,
    validateDNI,
    validatePhone,
    validateNotFutureDate,
    validateAgeCondition,
    clearErrors,
    clearError,
    addError,
    hasErrors
  } = useValidations();

  const [cics, setCics] = useState([]);
  const [condiciones, setCondiciones] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);

  // Watch fields para validación en tiempo real
  const watchedDNI = watch('dni');
  const watchedPhone = watch('telefono');
  const watchedFecha = watch('fecha_relevamiento');

  // Validar DNI en tiempo real
  useEffect(() => {
    if (watchedDNI) {
      validateDNI(watchedDNI);
    }
  }, [watchedDNI, validateDNI]);

  // Validar teléfono en tiempo real
  useEffect(() => {
    if (watchedPhone) {
      validatePhone(watchedPhone);
    }
  }, [watchedPhone, validatePhone]);

  // Validar fecha en tiempo real
  useEffect(() => {
    if (watchedFecha) {
      validateNotFutureDate(watchedFecha, 'fecha_relevamiento');
    }
  }, [watchedFecha, validateNotFutureDate]);

  // Carga de catálogos
  useEffect(() => {
    Promise.all([
      getCIC(),
      getCondicionesFamiliar(),
      getMantenimientosEconomico()
    ]).then(([cicRes, condRes, mantRes]) => {
      setCics(cicRes.data);
      setCondiciones(condRes.data);
      setMantenimientos(mantRes.data);
    }).catch(err => {
      console.error('Error al cargar catálogos:', err);
      setServerErrors({ general: 'Error al cargar los datos necesarios' });
    });
  }, []);

  // Carga datos de beneficiario si estamos en edición
  useEffect(() => {
    if (!id || condiciones.length === 0) return;
    
    getBeneficiario(id)
      .then(res => {
        const data = res.data;
        reset({
          fecha_relevamiento: data.fecha_relevamiento,
          cic: String(data.cic_id),
          nombre: data.nombre,
          dni: data.dni,
          telefono: data.telefono,
          direccion: data.direccion,
          lena_social: data.lena_social ? 'Sí' : 'No',
          actividades_cic: data.actividades_cic ? 'Sí' : 'No',
          ingresos_formales: data.ingresos_formales ? 'Sí' : 'No',
          huerta: data.huerta ? 'Sí' : 'No',
          mantenimiento_economico: String(data.mantenimiento_economico_id),
          observaciones: data.observaciones,
          integrantes: data.familiares.map(i => ({
            nombre: i.nombre,
            dni: i.dni,
            fecha_nac: i.fecha_nacimiento,
            escolaridad: i.escolaridad ? 'Sí' : 'No',
            vinculo: i.vinculo,
            condicion: condiciones.find(c => c.id === i.condicion_id)?.descripcion || ''
          }))
        });
      })
      .catch(err => {
        console.error('Error al cargar beneficiario:', err);
        setServerErrors({ general: 'Error al cargar los datos del beneficiario' });
      });
  }, [id, condiciones, reset]);

  const onSubmit = async (data) => {
    // Limpiar errores previos
    clearErrors();
    setServerErrors(null);
    
    // Validar DNIs únicos en familiares
    const dnisFamiliares = new Set();
    let hasDuplicates = false;
    
    data.integrantes.forEach((integrante, index) => {
      if (dnisFamiliares.has(integrante.dni)) {
        addError(`integrante_${index}_dni`, `DNI ${integrante.dni} duplicado en el grupo familiar`);
        hasDuplicates = true;
      }
      dnisFamiliares.add(integrante.dni);
      
      // Validar que el DNI del familiar no sea igual al del beneficiario
      if (integrante.dni === data.dni) {
        addError(`integrante_${index}_dni`, 'El familiar no puede tener el mismo DNI que el beneficiario');
        hasDuplicates = true;
      }
    });
    
    if (hasDuplicates || hasErrors) {
      return;
    }

    const mapCondicionId = (value) => {
      if (!isNaN(value)) return Number(value);
      const found = condiciones.find(c => c.descripcion === value);
      return found ? found.id : null;
    };

    const payload = {
      cic_id: Number(data.cic),
      fecha_relevamiento: data.fecha_relevamiento,
      nombre: data.nombre,
      dni: data.dni,
      telefono: data.telefono,
      direccion: data.direccion,
      lena_social: data.lena_social === 'Sí',
      actividades_cic: data.actividades_cic === 'Sí',
      ingresos_formales: data.ingresos_formales === 'Sí',
      huerta: data.huerta === 'Sí',
      mantenimiento_economico_id: Number(data.mantenimiento_economico),
      observaciones: data.observaciones,
      integrantes: data.integrantes.map(i => ({
        nombre: i.nombre,
        dni: i.dni,
        fecha_nac: i.fecha_nac,
        escolaridad: i.escolaridad === 'Sí',
        vinculo: i.vinculo,
        condicion_id: mapCondicionId(i.condicion)
      }))
    };

    setIsSubmitting(true);
    
    try {
      if (id) {
        await putBeneficiario(id, payload);
        alert('✅ Beneficiario actualizado correctamente');
      } else {
        await postRegistro(payload);
        alert('✅ Beneficiario registrado correctamente');
      }
      navigate('/beneficiarios');
    } catch (err) {
      setIsSubmitting(false);
      
      // Manejar errores del servidor
      if (err.response?.data?.details) {
        const serverValidationErrors = {};
        err.response.data.details.forEach(error => {
          serverValidationErrors[error.field] = error.message;
        });
        setServerErrors(serverValidationErrors);
      } else {
        setServerErrors({ 
          general: err.response?.data?.error || 'Error al procesar el formulario' 
        });
      }
    }
  };

  const openNew = () => {
    setCurrentIdx(null);
    setModalOpen(true);
  };

  const handleSaveIntegrante = (integrante) => {
    // Validar integrante antes de guardarlo
    if (!validateDNI(integrante.dni, 'integrante_dni')) {
      return;
    }
    
    // Validar coherencia edad-condición
    if (integrante.fecha_nac && integrante.condicion) {
      if (!validateAgeCondition(integrante.fecha_nac, integrante.condicion, 'integrante_condicion')) {
        return;
      }
    }
    
    clearError('integrante_dni');
    clearError('integrante_condicion');
    
    if (currentIdx !== null) {
      update(currentIdx, integrante);
    } else {
      append(integrante);
    }
    setModalOpen(false);
  };

  // Combinar todos los errores
  const allErrors = { ...validationErrors, ...serverErrors };

  return (
    <div className="container">
      <h2>Formulario de Registro - Programa Panadería Social</h2>
      
      {/* Mostrar errores de validación */}
      {Object.keys(allErrors).length > 0 && (
        <ValidationFeedback errors={allErrors} />
      )}

      {/* Datos del Relevamiento */}
      <div className="section">
        <h3>Datos del Relevamiento</h3>

        <ValidatedInput
          label="Fecha del relevamiento"
          type="date"
          {...register('fecha_relevamiento', { required: 'La fecha es requerida' })}
          error={validationErrors.fecha_relevamiento || formErrors.fecha_relevamiento?.message}
          required
        />

        <label>CIC</label>
        <select {...register('cic', { required: true })}>
          <option value="">— Seleccione CIC —</option>
          {cics.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {/* Datos del Referente Familiar */}
      <div className="section">
        <h3>Datos del Referente Familiar</h3>

        <label>Nombre y Apellido</label>
        <input type="text" {...register('nombre', { required: true })} />

        <ValidatedInput
          label="DNI"
          type="text"
          {...register('dni', { required: 'El DNI es requerido' })}
          error={validationErrors.dni || formErrors.dni?.message}
          maxLength={8}
          pattern="[0-9]*"
          helpText="Ingrese solo números, entre 7 y 8 dígitos"
          required
        />

        <ValidatedInput
          label="Teléfono"
          type="tel"
          {...register('telefono', { required: 'El teléfono es requerido' })}
          error={validationErrors.telefono || formErrors.telefono?.message}
          helpText="Ej: 381 4123456"
          required
        />

        <label>Dirección</label>
        <input type="text" {...register('direccion', { required: true })} />
      </div>

      {/* Composición del Grupo Familiar */}
      <div className="section">
        <h3>Composición del Grupo Familiar</h3>
        <button className="btn" type="button" onClick={openNew}>
          Agregar Integrante
        </button>
        
        {validationErrors.integrante_dni && (
          <div className="error-text" style={{ marginTop: '0.5rem' }}>
            {validationErrors.integrante_dni}
          </div>
        )}
        
        {validationErrors.integrante_condicion && (
          <div className="error-text" style={{ marginTop: '0.5rem' }}>
            {validationErrors.integrante_condicion}
          </div>
        )}
        
        <table id="tablaIntegrantes" className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Fecha Nac.</th>
              <th>Escolaridad</th>
              <th>Vínculo</th>
              <th>Condición</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f, idx) => (
              <tr key={f.id}>
                <td>{f.nombre}</td>
                <td>{f.dni}</td>
                <td>{f.fecha_nac}</td>
                <td>{f.escolaridad}</td>
                <td>{f.vinculo}</td>
                <td>{f.condicion}</td>
                <td>
                  <button 
                    className='btn' 
                    type="button"
                    onClick={() => { 
                      setCurrentIdx(idx); 
                      setModalOpen(true); 
                    }}
                  >
                    Editar
                  </button>
                  <button 
                    className='btndel' 
                    type="button"
                    onClick={() => remove(idx)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resto del formulario... */}
      <div className="section">
        <label>¿Retira leña social?</label>
        <select {...register('lena_social', { required: true })}>
          <option value="">Seleccione...</option>
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </select>

        <label>¿Participa en actividades del CIC?</label>
        <select {...register('actividades_cic', { required: true })}>
          <option value="">Seleccione...</option>
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </select>

        <label>¿Posee ingresos formales?</label>
        <select {...register('ingresos_formales', { required: true })}>
          <option value="">Seleccione...</option>
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </select>

        <label>¿Cuenta con huerta?</label>
        <select {...register('huerta', { required: true })}>
          <option value="">Seleccione...</option>
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </select>
      </div>

      <div className="section">
        <label>Mantenimiento Económico</label>
        <select {...register('mantenimiento_economico', { required: true })}>
          <option value="">Seleccione...</option>
          {mantenimientos.map(m => (
            <option key={m.id} value={m.id}>{m.descripcion}</option>
          ))}
        </select>
      </div>

      <div className="section">
        <h3>Observaciones</h3>
        <textarea
          rows="4"
          placeholder="Situación relevante, derivaciones, etc."
          {...register('observaciones')}
        />
      </div>

      <div className="section" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button 
          className="btn" 
          type="button" 
          onClick={() => navigate('/beneficiarios')}
          style={{ background: '#6c757d' }}
        >
          Cancelar
        </button>
        <button 
          className="btn" 
          type="button" 
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || hasErrors}
          style={{ 
            opacity: (isSubmitting || hasErrors) ? 0.6 : 1,
            cursor: (isSubmitting || hasErrors) ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Procesando...' : (id ? 'Actualizar' : 'Registrar')}
        </button>
      </div>

      <ModalIntegrante
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          clearError('integrante_dni');
          clearError('integrante_condicion');
        }}
        onSave={handleSaveIntegrante}
        initial={currentIdx !== null ? fields[currentIdx] : null}
      />
    </div>
  );
}