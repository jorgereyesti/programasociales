// routes/productos.js
const express = require('express');
const router = express.Router();
const { Producto } = require('../models');

// validacion si luego implemento control de stock)
router.get('/check-stock', async (req, res) => {
  try {
    const { producto_id, cantidad } = req.query;
    
    if (!producto_id || !cantidad) {
      return res.status(400).json({ 
        error: 'Producto y cantidad son requeridos' 
      });
    }
    
    // Por ahora, retornar siempre disponible
    // En el futuro, implementar tabla de stock
    res.json({
      available: true,
      stock: 9999,
      requested: Number(cantidad),
      canFulfill: true
    });
  } catch (error) {
    console.error('Error verificando stock:', error);
    res.status(500).json({ error: 'Error al verificar stock' });
  }
});
// GET /productos → devuelve todos los productos ordenados alfabéticamente
router.get('/', async (req, res) => {
  try {
    const lista = await Producto.findAll({ order: [['nombre', 'ASC']] });
    res.json(lista);
  } catch (err) {
    console.error('Error al listar productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

module.exports = router;
