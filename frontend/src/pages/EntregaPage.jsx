import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEntregas } from '../services/api';
import CardKPI from '../components/CardKPI';
import TablaEntregas from '../components/TablaEntregas';

export default function EntregaPage() {
  const [entregas, setEntregas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCIC, setSelectedCIC] = useState('');
  const [showCICFilter, setShowCICFilter] = useState(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEntregas() {
      try {
        const { data: lista } = await getEntregas({ all: true });
        setEntregas(lista);
      } catch (err) {
        console.error('Error cargando entregas:', err);
      }
    }
    fetchEntregas();
  }, []);

  // Tipar búsqueda
  const isNumericSearch = (term) => /^\d+$/.test(term.trim());
  const searchType = useMemo(() => {
    if (!searchTerm) return 'nombre';
    return isNumericSearch(searchTerm) ? 'dni' : 'nombre';
  }, [searchTerm]);
  const getSearchPlaceholder = () => {
    if (!searchTerm) return 'Buscar por nombre o DNI.';
    return searchType === 'dni' ? 'Buscando por DNI.' : 'Buscando por nombre.';
  };

  // Filtrado y búsqueda
  const filteredEntregas = useMemo(() => {
    let filtered = entregas;
    if (searchTerm) {
      if (searchType === 'dni') {
        filtered = filtered.filter(e => e.beneficiario.dni.includes(searchTerm));
      } else {
        filtered = filtered.filter(e =>
          e.beneficiario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.beneficiario.apellido.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }
    if (selectedCIC) {
      filtered = filtered.filter(e => e.cic_nombre === selectedCIC);
    }
    return filtered;
  }, [entregas, searchTerm, searchType, selectedCIC]);

  // Opciones CIC
  const cicOptions = useMemo(() => {
    const cics = [...new Set(entregas.map(e => e.cic_nombre))];
    return cics.filter(Boolean).sort();
  }, [entregas]);

  // Paginación
  const totalPages = Math.ceil(filteredEntregas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntregas = filteredEntregas.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCIC]);

  // Exportar CSV
  const exportToCSV = () => {
    const dataToExport = filteredEntregas;
    const headers = ['Fecha', 'Apellido y Nombre', 'DNI', 'Lugar', 'Entregado'];
    const rows = dataToExport.map(e => [
      new Date(e.fecha).toLocaleDateString(),
      `${e.beneficiario.apellido}, ${e.beneficiario.nombre}`,
      e.beneficiario.dni,
      e.cic_nombre || e.lugar,
      e.entregado ? 'Sí' : 'No'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `entregas_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCIC('');
    setShowCICFilter(false);
  };

  const handlePrevious = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1,2,3,4,'...', totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1,'...', totalPages-3, totalPages-2, totalPages-1, totalPages);
      else pages.push(1,'...', currentPage-1, currentPage, currentPage+1,'...', totalPages);
    }
    return pages;
  };

  // KPIs
  const familiasBeneficiadas = useMemo(() => new Set(entregas.map(e => e.beneficiario.id_programa_social)).size, [entregas]);
  const tortillasEntregadas = useMemo(() => entregas.filter(e => e.producto === 'Tortilla').reduce((sum, e) => sum + (e.cantidad||0), 0), [entregas]);
  const panEntregado = useMemo(() => entregas.filter(e => e.producto === 'Pan').reduce((sum, e) => sum + (e.cantidad||0), 0), [entregas]);

  return (
    <section className="page-section">
      <div className="beneficiarios-header">
        <h1>Entregas</h1>
        <button className="btn-primary" onClick={() => navigate('/entregas/nuevo')}>Nueva Entrega</button>
      </div>

      <div className="kpi-container">
        <CardKPI label="Familias Beneficiadas" value={familiasBeneficiadas} />
        <CardKPI label="Tortillas Entregadas" value={tortillasEntregadas} />
        <CardKPI label="Pan Entregado" value={panEntregado} />
      </div>

      <div className="beneficiarios-content">
        <h2>Listado de entregas</h2>
        <div className="search-controls">
          <div className="search-section">
            <div className="search-input-group">
              <input
                type="text"
                className="search-input"
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm('')} title="Limpiar búsqueda">✕</button>
              )}
              {searchTerm && (
                <div className="search-type-indicator">
                  {searchType === 'dni' ? '🔢' : '📝'}
                </div>
              )}
            </div>
          </div>

          <div className="filter-section">
            <button className={`btn-filter ${showCICFilter ? 'active' : ''}`} onClick={() => setShowCICFilter(!showCICFilter)}>
              Filtrar por CIC
            </button>
            <button className="btn-export" onClick={exportToCSV} disabled={filteredEntregas.length === 0}>
              Exportar CSV
            </button>
            {(searchTerm || selectedCIC) && (
              <button className="btn-clear-filters" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {showCICFilter && (
          <div className="cic-filter">
            <select className="cic-select" value={selectedCIC} onChange={e => setSelectedCIC(e.target.value)}>
              <option value="">Todos los CICs</option>
              {cicOptions.map(cic => (<option key={cic} value={cic}>{cic}</option>))}
            </select>
          </div>
        )}

        <TablaEntregas
          data={currentEntregas}
        />

        {filteredEntregas.length === 0 && (
          <div className="no-results">
            <p>No se encontraron entregas con los criterios de búsqueda.</p>
            <button className="btn-clear-filters" onClick={clearFilters}>Limpiar filtros</button>
          </div>
        )}

        {/* Paginación */}
        <div className="pagination-info">
          Mostrando {filteredEntregas.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredEntregas.length)} de {filteredEntregas.length} entregas
          {(searchTerm || selectedCIC) && (
            <span className="filter-indicator">
              {filteredEntregas.length < entregas.length && ` (filtrados de ${entregas.length})`}
            </span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="pagination-btn" onClick={handlePrevious} disabled={currentPage === 1}>Anterior</button>
            <div className="pagination-numbers">
              {getPageNumbers().map((p, idx) => (
                <button
                  key={idx}
                  className={`pagination-number ${p === currentPage ? 'active' : ''} ${p === '...' ? 'ellipsis' : ''}`}
                  onClick={() => typeof p === 'number' && setCurrentPage(p)}
                  disabled={p === '...'}
                >{p}</button>
              ))}
            </div>
            <button className="pagination-btn" onClick={handleNext} disabled={currentPage === totalPages}>Siguiente</button>
          </div>
        )}
      </div>
    </section>
  );
}
