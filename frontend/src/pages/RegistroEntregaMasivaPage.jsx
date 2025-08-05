import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCIC, getProductos, getBeneficiariosCIC, postEntregaMasiva } from '../services/api';
import '../App.css';
import '../index.css';
import './regBeneficiario.css';

export default function RegistroEntregaMasivaPage() {
  const navigate = useNavigate();
  const [cics, setCics] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selectedCIC, setSelectedCIC] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [detalles, setDetalles] = useState('');
  const [beneficiariosCIC, setBeneficiariosCIC] = useState([]);
  const [selectedBeneficiarios, setSelectedBeneficiarios] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    async function fetchData() {
      try {
        const [cicRes, prodRes] = await Promise.all([
          getCIC(),
          getProductos()
        ]);
        setCics(cicRes.data);
        setProductos(prodRes.data);
      } catch (err) {
        console.error('Error cargando datos:', err);
      }
    }
    fetchData();
  }, []);

  // Cargar beneficiarios cuando se selecciona un CIC
  useEffect(() => {
    if (selectedCIC) {
      async function loadBeneficiariosCIC() {
        try {
          const response = await getBeneficiariosCIC(selectedCIC);
          const beneficiarios = response.data;
          setBeneficiariosCIC(beneficiarios);
          // Por defecto, seleccionar todos
          setSelectedBeneficiarios(new Set(beneficiarios.map(b => b.id)));
        } catch (err) {
          console.error('Error cargando beneficiarios del CIC:', err);
          setBeneficiariosCIC([]);
        }
      }
      loadBeneficiariosCIC();
    } else {
      setBeneficiariosCIC([]);
      setSelectedBeneficiarios(new Set());
    }
  }, [selectedCIC]);

  // Filtrar beneficiarios por búsqueda
  const filteredBeneficiarios = beneficiariosCIC.filter(b => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return b.nombre.toLowerCase().includes(term) || b.dni.includes(term);
  });

  // Toggle selección individual
  const toggleBeneficiario = (id) => {
    const newSelected = new Set(selectedBeneficiarios);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBeneficiarios(newSelected);
  };

  // Seleccionar/deseleccionar todos
  const toggleAll = () => {
    if (selectedBeneficiarios.size === filteredBeneficiarios.length) {
      // Si todos están seleccionados, deseleccionar todos
      setSelectedBeneficiarios(new Set());
    } else {
      // Seleccionar todos los filtrados
      setSelectedBeneficiarios(new Set(filteredBeneficiarios.map(b => b.id)));
    }
  };

  // Validar formulario
  const isFormValid = () => {
    return selectedCIC && selectedProduct && cantidad && fecha && selectedBeneficiarios.size > 0;
  };

  // Procesar entregas masivas
  const handleSubmit = async () => {
    if (!isFormValid()) {
      alert('Por favor complete todos los campos y seleccione al menos un beneficiario');
      return;
    }

    setIsLoading(true);

    try {
      // Usar el endpoint masivo
      const response = await postEntregaMasiva({
        beneficiarios_ids: Array.from(selectedBeneficiarios),
        fecha_entrega: fecha,
        producto_id: Number(selectedProduct),
        cantidad: Number(cantidad),
        detalles: detalles || `Entrega masiva CIC ${cics.find(c => c.id === Number(selectedCIC))?.nombre}`,
        cic_id: Number(selectedCIC)
      });

      setIsLoading(false);
      alert(`✅ Se registraron ${response.data.cantidad} entregas exitosamente`);
      navigate('/entregas');
      
    } catch (error) {
      setIsLoading(false);
      console.error('Error en entregas masivas:', error);
      alert(`❌ Error al procesar las entregas: ${error.response?.data?.error || error.message}`);
    }
  };

  // Obtener nombre del CIC seleccionado
  const cicNombre = cics.find(c => c.id === Number(selectedCIC))?.nombre || '';

  return (
    <div className="container">
      <h2>Registro de Entrega Masiva</h2>
      
      {/* Sección de selección */}
      <div className="section">
        <label>Centro Integrador Comunitario (CIC)</label>
        <select 
          value={selectedCIC} 
          onChange={(e) => setSelectedCIC(e.target.value)}
        >
          <option value="">— Seleccione un CIC —</option>
          {cics.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <label>Producto a entregar</label>
        <select 
          value={selectedProduct} 
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">— Seleccione producto —</option>
          {productos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>

        <label>Cantidad por beneficiario (unidades o Kg)</label>
        <input 
          type="number" 
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          min="1"
        />

        <label>Fecha de entrega</label>
        <input 
          type="date" 
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <label>Observaciones (opcional)</label>
        <textarea
          rows="3"
          placeholder="Detalles adicionales de la entrega..."
          value={detalles}
          onChange={(e) => setDetalles(e.target.value)}
        />
      </div>

      {/* Sección de beneficiarios */}
      {selectedCIC && (
        <div className="section">
          <h3>Beneficiarios del {cicNombre}</h3>
          
          <div className="search-controls">
            <div className="search-section">
              <div className="search-input-group">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar por nombre o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div className="filter-section">
              <button 
                type="button"
                onClick={toggleAll}
                className="btn-filter"
              >
                {selectedBeneficiarios.size === filteredBeneficiarios.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
            </div>
          </div>

          <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '1rem' }}>
            {filteredBeneficiarios.length === 0 ? (
              <div className="no-results">
                <p>{searchTerm ? 'No se encontraron beneficiarios' : 'No hay beneficiarios en este CIC'}</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedBeneficiarios.size === filteredBeneficiarios.length && filteredBeneficiarios.length > 0}
                        onChange={toggleAll}
                      />
                    </th>
                    <th>Nombre</th>
                    <th>DNI</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBeneficiarios.map(b => (
                    <tr key={b.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedBeneficiarios.has(b.id)}
                          onChange={() => toggleBeneficiario(b.id)}
                        />
                      </td>
                      <td>{b.nombre}</td>
                      <td>{b.dni}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="pagination-info">
            {selectedBeneficiarios.size} de {beneficiariosCIC.length} beneficiarios seleccionados
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="section">
        {isFormValid() && (
          <div className="kpi-card" style={{ marginBottom: '1rem' }}>
            <div className="kpi-value">{selectedBeneficiarios.size}</div>
            <div className="kpi-label">Entregas a registrar</div>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            className="btn"
            onClick={() => navigate('/entregas')}
            style={{ background: '#ccc', color: '#333' }}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSubmit}
            disabled={!isFormValid() || isLoading}
            style={{ 
              opacity: (!isFormValid() || isLoading) ? 0.6 : 1,
              cursor: (!isFormValid() || isLoading) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Procesando...' : 'Registrar Entregas'}
          </button>
        </div>
      </div>
    </div>
  );
}