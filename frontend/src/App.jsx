import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

// páginas
import DashboardPage from './pages/DashboardPage'
import BeneficiariosPage from './pages/BeneficiariosPage'
import RegistroPage from './pages/RegistroPage'
import ProduccionPage from './pages/ProduccionPage'
import EntregaPage from './pages/EntregaPage'
import DatosPage from './pages/DatosPage'
import ConfiguracionPage from './pages/ConfiguracionPage'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuToggle = () => {
    setSidebarOpen((open) => !open)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="app-root">
      {/* Navbar con botón de hamburguesa */}
      <Navbar 
        onMenuClick={handleMenuToggle} 
        isMenuOpen={sidebarOpen}
      />

      <div className="app-body">
        {/* Sidebar off-canvas */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
        />

        {/* Contenido principal */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/beneficiarios" element={<BeneficiariosPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/produccion" element={<ProduccionPage />} />
            <Route path="/entregas" element={<EntregaPage />} />
            <Route path="/datos" element={<DatosPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}