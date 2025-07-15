const express = require('express');
const router = express.Router();
const { CatMantenimientoEconomico } = require('../models');

// GET /beneficiarios/cic
router.get('/', async (req, res) => {
  try {
    const man = await CatMantenimientoEconomico.findAll({    });
    res.json(man);
  } catch (err) {
    console.error('Error al listar Mantenimiento Economico:', err);
    res.status(500).json({ error: 'Error al listar Mantenimiento Economico' });
  }
});

module.exports = router;