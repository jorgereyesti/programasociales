import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProduccion, getProductos } from '../services/api';
import CardKPI from '../components/CardKPI';

export default function ProduccionPage() {
  const [producciones, setProducciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('Todos');
  const [showProductFilter, setShowProductFilter] = useState(false);

  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, prodsRes] = await Promise.all([
          getProduccion(),
          getProductos(),
        ]);
        setProducciones(prodRes.data);
        setProductos(prodsRes.data);
      } catch (err) {
        console.error('Error cargando producciones:', err);
      }
    }
    fetchData();
  }, []);

  const productoMap = useMemo(() => {
    return productos.reduce((acc, p) => {
      acc[p.id] = p.descripcion || p.nombre || p.id;
      return acc;
    }, {});
  }, [productos]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  // KPIs
  const totalKilogramos = useMemo(
    () => producciones.reduce((sum, p) => sum + (p.cantidad || 0), 0),
    [producciones]
  );
  const tortillas = useMemo(
    () => producciones
      .filter(p => productoMap[p.producto_id] === 'Tortillas')
      .reduce((sum, p) => sum + (p.cantidad || 0), 0),
    [producciones, productoMap]
  );
  const pan = useMemo(
    () => producciones
      .filter(p => productoMap[p.producto_id] === 'Pan')
      .reduce((sum, p) => sum + (p.cantidad || 0), 0),
    [producciones, productoMap]
  );
  const otros = useMemo(
    () => producciones
      .filter(p => {
        const nombre = productoMap[p.producto_id];
        return nombre !== 'Tortillas' && nombre !== 'Pan';
      })
      .reduce((sum, p) => sum + (p.cantidad || 0), 0),
    [producciones, productoMap]
  );

  // Filtrado por producto
  const filteredProducciones = useMemo(() => {
    if (filterType === 'Todos') return producciones;
    return producciones.filter(p => productoMap[p.producto_id] === filterType);
  }, [producciones, filterType, productoMap]);

  const totalPages = Math.ceil(filteredProducciones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredProducciones.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  const clearFilters = () => {
    setFilterType('Todos');
    setShowProductFilter(false);
  };

  const handleAdd = () => navigate('/produccion/nuevo');
  const handleFilterChange = (e) => setFilterType(e.target.value);
  const handlePrevious = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const handleExport = () => {
    const rows = [
      ['Fecha', 'Producto', 'Cantidad'],
      ...filteredProducciones.map(p => [
        formatDate(p.fecha_produccion || p.fecha || p.createdAt),
        productoMap[p.producto_id],
        p.cantidad,
      ])
    ];
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'produccion.csv');
    link.click();
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, '.', totalPages);
      else if (currentPage >= totalPages - 2) pages.push(1, '.', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, '.', currentPage - 1, currentPage, currentPage + 1, '.', totalPages);
    }
    return pages;
  };

  return (
    <section className="page-section">
      <div className="beneficiarios-header">
        <h1>Producción</h1>
      </div>

      <div className="kpi-container">
        <CardKPI label="Kilogramos Producidos" value={totalKilogramos} />
        <CardKPI label="Tortillas" value={tortillas} />
        <CardKPI label="Pan" value={pan} />
        <CardKPI label="Otros" value={otros} />
      </div>

      <div className="beneficiarios-content">
        <h2>Listado de Producción</h2>

        <div
          className="search-controls"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
          <button className="btn-primary" onClick={handleAdd}>
            Nueva Producción
          </button>

          <div className="search-input-group">
            <button
              className={`btn-filter ${showProductFilter ? 'active' : ''}`}
              onClick={() => setShowProductFilter(!showProductFilter)}
            >
              Filtrar por Producto
            </button>
            {showProductFilter && (
              <>
                <select
                  className="search-input"
                  value={filterType}
                  onChange={handleFilterChange}
                >
                  <option value="Todos">Todos</option>
                  {productos.map(p => (
                    <option key={p.id} value={productoMap[p.id]}>
                      {productoMap[p.id]}
                    </option>
                  ))}
                </select>
                {filterType !== 'Todos' && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setFilterType('Todos')}
                    title="Limpiar filtro"
                  >
                    ✕
                  </button>
                )}
              </>
            )}
          </div>

          <button className="btn-export" onClick={handleExport}>
            Exportar CSV
          </button>
          {filterType !== 'Todos' && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              Limpiar filtros
            </button>
          )}
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(p => (
              <tr key={p.id}>
                <td>{formatDate(p.fecha_produccion || p.fecha || p.createdAt)}</td>
                <td>{productoMap[p.producto_id]}</td>
                <td>{p.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducciones.length === 0 && (
          <div className="no-results">
            <p>No se encontraron registros.</p>
          </div>
        )}

        <div className="pagination-info">
          Mostrando {filteredProducciones.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredProducciones.length)} de {filteredProducciones.length} registros
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="pagination-btn" onClick={handlePrevious} disabled={currentPage === 1}>Anterior</button>
            <div className="pagination-numbers">
              {getPageNumbers().map((page, idx) => (
                <button
                  key={idx}
                  className={`pagination-number ${page === currentPage ? 'active' : ''} ${page === '.' ? 'ellipsis' : ''}`}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={page === '.'}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="pagination-btn" onClick={handleNext} disabled={currentPage === totalPages}>Siguiente</button>
          </div>
        )}
      </div>
    </section>
  );
}
