import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaThLarge, FaUsers, FaClipboardList, FaBoxOpen, FaDatabase, FaCog, FaSignOutAlt } from 'react-icons/fa';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  // Función para manejar el click en los enlaces (cerrar sidebar en móvil)
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay semitransparente */}
      <div
        className={`sidebar__overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>        
        <div className="sidebar-header">
          <h1>Panadería Social</h1>
          {/* Botón de cierre */}
          <button
            className="sidebar__close-btn"
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            end
            onClick={handleLinkClick}
          >
            <FaThLarge /> <span>Panel</span>
          </NavLink>
          <NavLink 
            to="/beneficiarios"
            onClick={handleLinkClick}
          >
            <FaUsers /> <span>Beneficiarios</span>
          </NavLink>
          <NavLink 
            to="/produccion"
            onClick={handleLinkClick}
          >
            <FaClipboardList /> <span>Producción</span>
          </NavLink>
          <NavLink 
            to="/entregas"
            onClick={handleLinkClick}
          >
            <FaBoxOpen /> <span>Entregas</span>
          </NavLink>    
          <NavLink 
            to="/configuracion"
            onClick={handleLinkClick}
          >
            <FaCog /> <span>Configuración</span>
          </NavLink>
        </nav>

        <button className="sidebar-logout">
          <FaSignOutAlt /> <span>Salir</span>
        </button>
      </aside>
    </>
  );
}