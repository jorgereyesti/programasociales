// routes/productos.js
const express = require('express');
const router = express.Router();
const { Producto } = require('../models');

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
