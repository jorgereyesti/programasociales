const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Entrega, Beneficiario, Producto, ProgramaSocial, Cic } = require('../models');


// GET /entregas with pagination & filters
router.get('/', async (req, res) => {
  try {
    const page       = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit      = Math.max(parseInt(req.query.limit) || 10,1);
    const sortBy     = req.query.sortBy || 'fecha_entrega';
    const order      = (req.query.order||'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset     = (page - 1) * limit;
    const { fecha_entrega, start_date, end_date, cic_id, dni } = req.query;
    const entregaWhere = {};

    if (fecha_entrega) entregaWhere.fecha_entrega = fecha_entrega;
    if (start_date && end_date) entregaWhere.fecha_entrega = { [Op.between]: [start_date, end_date] };

    const benWhere = {};
    if (cic_id) benWhere.cic_id = cic_id;
    if (dni)    benWhere.dni      = dni;

    const beneficiarioInclude = {
      model: Beneficiario,
      as: 'beneficiario',
      where: Object.keys(benWhere).length ? benWhere : undefined,
      required: !!Object.keys(benWhere).length,
      include: { model: Cic, as: 'cic' }
    };

    const { count, rows } = await Entrega.findAndCountAll({
      where: entregaWhere,
      include: [
        beneficiarioInclude,
        { model: Producto,      as: 'producto' },
        { model: ProgramaSocial,as: 'programa_social' }
      ],
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
    console.error('Error al listar entregas:', err);
    res.status(500).json({ error: 'Error al listar entregas' });
  }
});

// GET /entregas/:id → detalle de entrega
router.get('/:id', async (req, res) => {
  try {
    const ent = await Entrega.findByPk(req.params.id, {
      include: [
        { model: Beneficiario, as: 'beneficiario', include: { model: Cic, as: 'cic' } },
        { model: Producto, as: 'producto' },
        { model: ProgramaSocial, as: 'programa_social' }
      ]
    });
    if (!ent) return res.status(404).json({ error: 'Entrega no encontrada' });
    res.json(ent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener entrega' });
  }
});

// POST /entregas → crear nueva entrega
router.post('/', async (req, res) => {
  try {
    const { beneficiario_id, fecha_entrega, producto_id, cantidad, detalles } = req.body;
    const nueva = await Entrega.create({ beneficiario_id, fecha_entrega, producto_id, cantidad, detalles });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear entrega' });
  }
});

module.exports = router;