const express = require('express');
const router = express.Router();
const { Cic, Beneficiario, Familiar, CatCondicionFamiliar } = require('../models');

//Obtener todos
// GET /beneficiarios with pagination & optional filters
router.get('/', async (req, res) => {
  try {
    const includeDefs = [
      // JOIN con CIC para traer sólo nombre
      { model: Cic, as: 'cic', attributes: ['nombre'] },
      // JOIN con Familiar, y dentro JOIN con CondicionFamiliar
      {
        model: Familiar,
        as: 'familiares',
        include: [
          {
            model: CatCondicionFamiliar,
            as: 'condicion',          // debe coincidir con tu alias en el modelo
            attributes: ['descripcion']
          }
        ]
      }
    ];

    if (req.query.all === 'true') {
      const rows = await Beneficiario.findAll({ include: includeDefs });
      const items = rows.map(b => {
        const obj = b.toJSON();
        return {
          ...obj,
          cic_nombre: obj.cic.nombre,
          familiares: obj.familiares.map(f => ({
            ...f
          }))
        };
      });
      return res.json(items);
    }
    
    const page     = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit    = Math.max(parseInt(req.query.limit) || 10, 1);
    const sortBy   = req.query.sortBy  || 'created_at';
    const order    = (req.query.order||'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset   = (page - 1) * limit;
    const where    = {}; // aquí podés añadir filtros adicionales si los necesitas

    const { count, rows } = await Beneficiario.findAndCountAll({
      where,
      include: [{ model: Familiar, as: 'familiares' }],
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
    console.error('Error al listar beneficiarios:', err);
    res.status(500).json({ error: 'Error al listar beneficiarios' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ben = await Beneficiario.findByPk(req.params.id, {
      include: { model: Familiar, as: 'familiares' }
    });
    if (!ben) return res.status(404).json({ error: 'Beneficiario no encontrado' });
    res.json(ben);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener beneficiario' });
  }
});


module.exports = router;