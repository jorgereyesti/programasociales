const express = require('express');
const router = express.Router();
const { CatCondicionFamiliar } = require('../models');

// GET /beneficiarios/cic
router.get('/', async (req, res) => {
  try {
    const cond = await CatCondicionFamiliar.findAll({ });
    res.json(cond);
  } catch (err) {
    console.error('Error al listar Condicion Familiar:', err);
    res.status(500).json({ error: 'Error al listar Condicion' });
  }
});

module.exports = router;