const express = require('express');
const router = express.Router();
const { Familiar } = require('../models');

// GET /familiares
router.get('/', async (req, res) => {
  try {
    const allFam = await Familiar.findAll();
    res.json(allFam);
  } catch (err) {
    console.error('Error al listar familiares:', err);
    res.status(500).json({ error: 'Error al listar familiares' });
  }
});

module.exports = router;