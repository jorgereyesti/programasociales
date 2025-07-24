import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getBeneficiarios, getProductos, postEntrega } from '../services/api';
import '../App.css';
import '../index.css';
import './regBeneficiario.css';

export default function RegistroEntregaPage() {
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      fecha_entrega: '',
      beneficiario_id: '',
      producto_id: '',
      cantidad_u: '',
      detalles: ''
    }
  });

  const [beneficiarios, setBeneficiarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Cargar beneficiarios y productos
  useEffect(() => {
    async function fetchData() {
      try {
        const [bRes, pRes] = await Promise.all([getBeneficiarios(), getProductos()]);
        const bData = bRes.data;
        const bItems = Array.isArray(bData.items) ? bData.items : Array.isArray(bData) ? bData : [];
        setBeneficiarios(bItems);
        const pData = pRes.data;
        const pItems = Array.isArray(pData) ? pData : Array.isArray(pData.items) ? pData.items : [];
        setProductos(pItems);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setBeneficiarios([]);
        setProductos([]);
      }
    }
    fetchData();
  }, []);

  // Manejo de búsqueda y sugerencias
  const onSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length >= 2) {
      const filtered = beneficiarios.filter(b =>
        b.dni.includes(term) || b.nombre.toLowerCase().includes(term.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      setValue('beneficiario_id', '');
    }
  };

  const selectBeneficiario = (b) => {
    setSearchTerm(`${b.dni} - ${b.nombre}`);
    setValue('beneficiario_id', b.id);
    setShowSuggestions(false);
  };

  // Envío del formulario
  const onSubmit = async (data) => {
    const payload = {
      fecha_entrega: data.fecha_entrega,
      beneficiario_id: Number(data.beneficiario_id),
      producto_id: Number(data.producto_id),
      cantidad: Number(data.cantidad_u),
      detalles: data.detalles
    };

    try {
      await postEntrega(payload);
      alert('Entrega registrada correctamente.');
      reset();
      setSearchTerm('');
    } catch (err) {
      alert(`Error al registrar entrega: ${err.message}`);
    }
  };

  return (
    <div className="container">
      <h2>Agregar Entrega</h2>
      <div className="section">
        <label>Buscar Referente</label>
        <input
          type="text"
          placeholder="DNI/Nombre y Apellido"
          value={searchTerm}
          onChange={onSearchChange}
          className="search-input"
        />
        <input type="hidden" {...register('beneficiario_id', { required: true })} />
        {showSuggestions && (
          <ul className="suggestions-list">
            {suggestions.map(b => (
              <li key={b.id} onClick={() => selectBeneficiario(b)}>
                {b.dni} - {b.nombre}
              </li>
            ))}
          </ul>
        )}

        <label>Fecha de Entrega</label>
        <input
          type="date"
          {...register('fecha_entrega', { required: true })}
        />

        <label>Producto</label>
        <select {...register('producto_id', { required: true })}>
          <option value="">— Seleccione producto —</option>
          {productos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

        <label>Cantidad (unidades o Kg)</label>
        <input type="number" {...register('cantidad_u', { required: true, min: 1 })} />

        <label>Observaciones</label>
        <textarea
          rows="3"
          placeholder="Corresponde a la entrega realizada en CIC Vial III"
          {...register('detalles')}
        />
      </div>

      <div className="section" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          type="button"
          className="btn"
          onClick={() => { reset(); setSearchTerm(''); }}
          style={{ background: '#ccc', color: '#333' }}
        >
          Cancelar
        </button>
        <button className="btn" onClick={handleSubmit(onSubmit)}>
          Agregar
        </button>
      </div>
    </div>
  );
}
