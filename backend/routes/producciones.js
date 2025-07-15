const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { ProduccionPanaderia, Producto } = require('../models');

// GET /producciones
// Admite query params: 
//   - fecha=YYYY-MM-DD 
//   - start_date=YYYY-MM-DD & end_date=YYYY-MM-DD 
//   - producto_id=#
// GET /producciones with pagination & filters
router.get('/', async (req, res) => {
  try {
    const page       = Math.max(parseInt(req.query.page)  || 1,  1);
    const limit      = Math.max(parseInt(req.query.limit) || 10, 1);
    const sortBy     = req.query.sortBy  || 'fecha';
    const order      = (req.query.order||'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset     = (page - 1) * limit;
    const { fecha, start_date, end_date, producto_id } = req.query;
    const where      = {};

    if (fecha) where.fecha = fecha;
    if (start_date && end_date) where.fecha = { [Op.between]: [start_date, end_date] };
    if (producto_id) where.producto_id = producto_id;

    const { count, rows } = await ProduccionPanaderia.findAndCountAll({
      where,
      include: [{ model: Producto, as: 'producto' }],
      order: [[sortBy, order]],
      limit,
      offset
    });

    res.json({
      totalItems:   count,
      totalPages:   Math.ceil(count / limit),
      currentPage:  page,
      items:        rows
    });
  } catch (err) {
    console.error('Error al listar producciones:', err);
    res.status(500).json({ error: 'Error al listar producciones' });
  }
});


// GET /producciones/:id
router.get('/:id', async (req, res) => {
  try {
    const prod = await ProduccionPanaderia.findByPk(req.params.id, {
      include: { model: Producto, as: 'producto' }
    });
    if (!prod) return res.status(404).json({ error: 'Producción no encontrada' });
    res.json(prod);
  } catch (error) {
    console.error('Error al obtener producción:', error);
    res.status(500).json({ error: 'Error al obtener producción' });
  }
});

// POST /producciones
router.post('/', async (req, res) => {
  try {
    const { fecha, producto_id, cantidad } = req.body;
    const nueva = await ProduccionPanaderia.create({ fecha, producto_id, cantidad });
    res.status(201).json(nueva);
  } catch (error) {
    console.error('Error al crear producción:', error);
    res.status(500).json({ error: 'Error al crear producción' });
  }
});

module.exports = router;
