import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBeneficiarios, deleteBeneficiario } from '../services/api';
import CardKPI from '../components/CardKPI';
import TablaBeneficiarios from '../components/TablaBeneficiarios';

export default function BeneficiariosPage() {
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCIC, setSelectedCIC] = useState('');
  const [showCICFilter, setShowCICFilter] = useState(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAll() {
      try {
        // Traemos todos los beneficiarios con familiares y condición anidada
        const { data: benList } = await getBeneficiarios({ all: true });
        setBeneficiarios(benList);
      } catch (err) {
        console.error('Error cargando beneficiarios:', err);
      }
    }
    fetchAll();
  }, []);

  // Función para detectar si el término de búsqueda es un DNI (número)
  const isNumericSearch = (term) => {
    return /^\d+$/.test(term.trim());
  };

  // Determinar el tipo de búsqueda automáticamente
  const searchType = useMemo(() => {
    if (!searchTerm) return 'nombre';
    return isNumericSearch(searchTerm) ? 'dni' : 'nombre';
  }, [searchTerm]);

  // Aplanamos todos los familiares para estadísticas
  const allFamiliares = useMemo(
    () => {
      console.log('Recalculando allFamiliares, beneficiarios:', beneficiarios.length);
      return beneficiarios.flatMap(b => b.familiares || []);
    },
    [beneficiarios]
  );

  // Cálculo de KPIs
  const familiasCount = beneficiarios.length;
  
  const discapCount = useMemo(
    () => {
      console.log('Recalculando discapCount, allFamiliares:', allFamiliares.length);
      return allFamiliares.filter(f => f.condicion?.descripcion === 'Discapacidad').length;
    },
    [allFamiliares]
  );
  
  const menoresCount = useMemo(
    () => {
      console.log('Recalculando menoresCount');
      return allFamiliares.filter(f => f.condicion?.descripcion === 'Menor de Edad').length;
    },
    [allFamiliares]
  );
  
  const adultosCount = useMemo(
    () => {
      console.log('Recalculando adultosCount');
      return allFamiliares.filter(f => f.condicion?.descripcion === 'Adulto Mayor').length;
    },
    [allFamiliares]
  );

  // Filtrado y búsqueda
  const filteredBeneficiarios = useMemo(() => {
    let filtered = beneficiarios;
    
    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(b => {
        if (searchType === 'dni') {
          return b.dni.includes(searchTerm);
        } else {
          return b.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
    }
    
    // Filtro por CIC
    if (selectedCIC) {
      filtered = filtered.filter(b => b.cic_nombre === selectedCIC);
    }
    
    return filtered;
  }, [beneficiarios, searchTerm, searchType, selectedCIC]);

  // Obtener lista única de CICs
  const cicOptions = useMemo(() => {
    const cics = [...new Set(beneficiarios.map(b => b.cic_nombre))];
    return cics.filter(Boolean).sort();
  }, [beneficiarios]);

  // Cálculos de paginación basados en datos filtrados
  const totalPages = Math.ceil(filteredBeneficiarios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBeneficiarios = filteredBeneficiarios.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCIC]);

  // Función para exportar a CSV
  const exportToCSV = () => {
    const dataToExport = filteredBeneficiarios;
    
    // Crear encabezados
    const headers = ['Apellido y Nombre', 'DNI', 'CIC'];
    
    // Convertir datos a formato CSV
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(b => [
        `"${b.nombre}"`,
        `"${b.dni}"`,
        `"${b.cic_nombre}"`
      ].join(','))
    ].join('\n');
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `beneficiarios_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCIC('');
    setShowCICFilter(false);
  };

  // Handlers de navegación y borrado
  const handleAdd = () => navigate('nuevo');
  const handleEdit = id => navigate(`/registro/${id}`);
  const handleDelete = async id => {
    if (window.confirm('¿Eliminar este beneficiario?')) {
      try {
        await deleteBeneficiario(id);
        setBeneficiarios(prev => {
          const updated = prev.filter(b => b.id !== id);
          // Ajustar página actual si es necesario
          const newTotalPages = Math.ceil(updated.length / itemsPerPage);
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
          }
          return updated;
        });
      } catch (err) {
        console.error('Error eliminando beneficiario:', err);
      }
    }
  };

  // Handlers de paginación
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Función para obtener el placeholder dinámico
  const getSearchPlaceholder = () => {
    if (!searchTerm) return 'Buscar por nombre o DNI...';
    return searchType === 'dni' ? 'Buscando por DNI...' : 'Buscando por nombre...';
  };

  return (
    <section className="page-section">
      <div className="beneficiarios-header">
        <h1>Beneficiarios</h1>
        <button className="btn-primary" onClick={handleAdd}>
          Nuevo Beneficiario
        </button>
      </div>

      <div className="kpi-container">
        <CardKPI label="Familias" value={familiasCount} />
        <CardKPI label="Discapacidad" value={discapCount} />
        <CardKPI label="Menores de edad" value={menoresCount} />
        <CardKPI label="Adulto Mayor" value={adultosCount} />
      </div>

      <div className="beneficiarios-content">
        {/* Controles de búsqueda y filtros */}
        <h2>Listado de beneficiarios</h2>
        <div className="search-controls">
          <div className="search-section">    
            <div className="search-input-group">
              <input
                type="text"
                className="search-input"
                placeholder={getSearchPlaceholder()}
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
              
              {/* Indicador visual del tipo de búsqueda */}
              {searchTerm && (
                <div className="search-type-indicator">
                  {searchType === 'dni' ? '🔢' : '📝'}
                </div>
              )}
            </div>
          </div>

          <div className="filter-section">
            <button 
              className={`btn-filter ${showCICFilter ? 'active' : ''}`}
              onClick={() => setShowCICFilter(!showCICFilter)}
            >
              Filtrar por CIC
            </button>
            
            <button 
              className="btn-export"
              onClick={exportToCSV}
              disabled={filteredBeneficiarios.length === 0}
            >
              Exportar CSV
            </button>
            
            {(searchTerm || selectedCIC) && (
              <button 
                className="btn-clear-filters"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
        
        {/* Filtro de CIC desplegable */}
        {showCICFilter && (
          <div className="cic-filter">
            <select
              className="cic-select"
              value={selectedCIC}
              onChange={(e) => setSelectedCIC(e.target.value)}
            >
              <option value="">Todos los CICs</option>
              {cicOptions.map(cic => (
                <option key={cic} value={cic}>{cic}</option>
              ))}
            </select>
          </div>
        )}
              
        <TablaBeneficiarios
          data={currentBeneficiarios}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Mensaje cuando no hay resultados */}
        {filteredBeneficiarios.length === 0 && (
          <div className="no-results">
            <p>No se encontraron beneficiarios con los criterios de búsqueda.</p>
            <button className="btn-clear-filters" onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>
        )}

          <div className="pagination-info">
            Mostrando {filteredBeneficiarios.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredBeneficiarios.length)} de {filteredBeneficiarios.length} beneficiarios
            {(searchTerm || selectedCIC) && (
              <span className="filter-indicator">
                {filteredBeneficiarios.length < beneficiarios.length && ` (filtrados de ${beneficiarios.length})`}
              </span>
            )}
          </div>
       
        {/* Componente de paginación */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn" 
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            
            <div className="pagination-numbers">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  className={`pagination-number ${
                    page === currentPage ? 'active' : ''
                  } ${page === '...' ? 'ellipsis' : ''}`}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === '...'}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button 
              className="pagination-btn" 
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </section>
  );
}