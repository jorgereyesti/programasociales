const express = require('express');
const router = express.Router();
const { Cic } = require('../models');

// GET /beneficiarios/cic
router.get('/', async (req, res) => {
  try {
    const cics = await Cic.findAll({
      order: [['nombre', 'ASC']]   // opcional: orden alfabético
    });
    res.json(cics);
  } catch (err) {
    console.error('Error al listar CICs:', err);
    res.status(500).json({ error: 'Error al listar CICs' });
  }
});

module.exports = router;