import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  getCIC,
  getCondicionesFamiliar,
  getMantenimientosEconomico,
  postRegistro,
  getBeneficiario,
  putBeneficiario
} from '../services/api';
import { useParams } from 'react-router-dom';
import ModalIntegrante from '../components/ModalIntegrante';
import '../App.css';
import '../index.css';
import './regBeneficiario.css';

export default function RegistroPage() {
  const { id } = useParams();
  const {
    register,
    control,
    handleSubmit,
    reset
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

  const [cics, setCics] = useState([]);
  const [condiciones, setCondiciones] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(null);

  // Carga de catálogos
  useEffect(() => {
    getCIC()
      .then(res => setCics(res.data))
      .catch(err => console.error('Error al cargar CIC:', err));

    getCondicionesFamiliar()
      .then(res => setCondiciones(res.data))
      .catch(err => console.error('Error al cargar Condiciones:', err));

    getMantenimientosEconomico()
      .then(res => setMantenimientos(res.data))
      .catch(err => console.error('Error al cargar Mantenimientos:', err));
  }, []);

  // Carga datos de beneficiario si estamos en edición y cuando condiciones estén listas
  useEffect(() => {
    if (!id || condiciones.length === 0) return;
    getBeneficiario(id)
      .then(res => {
        const {
          fecha_relevamiento,
          cic_id,
          nombre,
          dni,
          telefono,
          direccion,
          lena_social,
          actividades_cic,
          ingresos_formales,
          huerta,
          mantenimiento_economico_id,
          observaciones,
          familiares
        } = res.data;
        reset({
          fecha_relevamiento,
          cic: String(cic_id),
          nombre,
          dni,
          telefono,
          direccion,
          lena_social: lena_social ? 'Sí' : 'No',
          actividades_cic: actividades_cic ? 'Sí' : 'No',
          ingresos_formales: ingresos_formales ? 'Sí' : 'No',
          huerta: huerta ? 'Sí' : 'No',
          mantenimiento_economico: String(mantenimiento_economico_id),
          observaciones,
          integrantes: familiares.map(i => ({
            nombre: i.nombre,
            dni: i.dni,
            fecha_nac: i.fecha_nacimiento,
            escolaridad: i.escolaridad ? 'Sí' : 'No',
            vinculo: i.vinculo,
            condicion: condiciones.find(c => c.id === i.condicion_id)?.descripcion || ''
          }))
        });
      })
      .catch(err => console.error('Error al cargar beneficiario:', err));
  }, [id, condiciones, reset]);

  const onSubmit = async (data) => {
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

    try {
      if (id) {
        await putBeneficiario(id, payload);
        alert('Beneficiario actualizado correctamente.');
      } else {
        await postRegistro(payload);
        alert('Formulario enviado correctamente.');
      }
      reset();
    } catch (err) {
      alert(`Error al enviar formulario: ${err.message}`);
    }
  };

  const openNew = () => {
    setCurrentIdx(null);
    setModalOpen(true);
  };

  const handleSaveIntegrante = (integrante) => {
    if (currentIdx !== null) update(currentIdx, integrante);
    else append(integrante);
    setModalOpen(false);
  };

  return (
    <div className="container">
      <h2>Formulario de Registro - Programa Panadería Social</h2>

      {/* Datos del Relevamiento */}
      <div className="section">
        <h3>Datos del Relevamiento</h3>

        <label>Fecha del relevamiento</label>
        <input type="date" {...register('fecha_relevamiento', { required: true })} />

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

        <label>DNI</label>
        <input type="text" {...register('dni', { required: true })} />

        <label>Teléfono</label>
        <input type="text" {...register('telefono', { required: true })} />

        <label>Dirección</label>
        <input type="text" {...register('direccion', { required: true })} />
      </div>

      {/* Composición del Grupo Familiar */}
      <div className="section">
        <h3>Composición del Grupo Familiar</h3>
        <button className="btn" type="button" onClick={openNew}>Agregar Integrante</button>
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
                <td>{f.escolaridad ? 'Sí' : 'No'}</td>
                <td>{f.vinculo}</td>
                <td>{condiciones.find(c => c.descripcion === f.condicion)?.descripcion || ''}</td>
                <td>
                  <button className='btn' onClick={() => { setCurrentIdx(idx); setModalOpen(true); }}>Editar</button>
                  <button className='btndel' onClick={() => remove(idx)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Condiciones del Hogar y Campos Adicionales */}
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

      {/* Mantenimiento Económico */}
      <div className="section">
        <label>Mantenimiento Económico</label>
        <select {...register('mantenimiento_economico', { required: true })}>
          <option value="">Seleccione...</option>
          {mantenimientos.map(m => (
            <option key={m.id} value={m.id}>{m.descripcion}</option>
          ))}
        </select>
      </div>

      {/* Observaciones */}
      <div className="section">
        <h3>Observaciones</h3>
        <textarea
          rows="4"
          placeholder="Situación relevante, derivaciones, etc."
          {...register('observaciones')}
        />
      </div>

      <button className="btn" type="button" onClick={handleSubmit(onSubmit)}>
        {id ? 'Actualizar' : 'Enviar'}
      </button>

      <ModalIntegrante
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveIntegrante}
        initial={
          currentIdx !== null ? fields[currentIdx] : null
        }
      />
    </div>
  );
}
