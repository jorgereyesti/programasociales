import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getProductos, postProduccion } from '../services/api';
import '../App.css';
import '../index.css';
import './regBeneficiario.css';

export default function RegistroProduccion() {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      fecha: '',
      producto_id: '',
      cantidad: ''
    }
  });

  const [productos, setProductos] = useState([]);

  useEffect(() => {
    getProductos()
      .then(res => setProductos(res.data))
      .catch(err => console.error('Error al cargar productos:', err));
  }, []);

  const onSubmit = async (data) => {
    const payload = {
      fecha: data.fecha,
      producto_id: Number(data.producto_id),
      cantidad: Number(data.cantidad)
    };

    try {
      await postProduccion(payload);
      alert('Producción registrada correctamente.');
      reset();
    } catch (err) {
      alert(`Error al enviar producción: ${err.message}`);
    }
  };

  return (
    <div className="container">
      <h2>Registro de Producción - Panadería Social</h2>

      <div className="section">
        <label>Fecha de Producción</label>
        <input type="date" {...register('fecha', { required: true })} />

        <label>Producto</label>
        <select {...register('producto_id', { required: true })}>
          <option value="">Seleccione un producto</option>
          {productos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

        <label>Cantidad Producida</label>
        <input type="number" {...register('cantidad', { required: true, min: 1 })} />
      </div>

      <button className="btn" type="button" onClick={handleSubmit(onSubmit)}>
        Guardar Producción
      </button>
    </div>
  );
}
