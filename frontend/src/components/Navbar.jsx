import React from 'react';
import logo from '../assets/logosmt.png';

export default function Navbar({ onMenuClick, isMenuOpen }) {
  return (
    <nav className="navbar">
      {/* Botón hamburguesa a la izquierda */}
      <button
        className={`navbar__menu-btn ${isMenuOpen ? 'active' : ''}`}
        type="button"
        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        onClick={onMenuClick}
      >
        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      {/* Logo centrado */}
      <img 
        src={logo} 
        alt="Logo Panadería Social" 
        className="navbar-logo" 
      />
    </nav>
  );
}