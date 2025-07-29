const express = require('express');
const router = express.Router();
const { Cic, Beneficiario, Familiar, CatCondicionFamiliar } = require('../models');

// Obtener todos los beneficiarios
// GET /beneficiarios with pagination & optional filters
router.get('/', async (req, res) => {
  try {
    const includeDefs = [
      { model: Cic, as: 'cic', attributes: ['nombre'] },
      {
        model: Familiar,
        as: 'familiares',
        include: [
          {
            model: CatCondicionFamiliar,
            as: 'condicion',
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
          familiares: obj.familiares.map(f => ({ ...f }))
        };
      });
      return res.json(items);
    }

    const page   = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit  = Math.max(parseInt(req.query.limit) || 10, 1);
    const sortBy = req.query.sortBy  || 'created_at';
    const order  = (req.query.order||'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const { count, rows } = await Beneficiario.findAndCountAll({
      where: {},
      include: [{ model: Familiar, as: 'familiares' }],
      order: [[sortBy, order]],
      limit,
      offset
    });

    res.json({
      totalItems:  count,
      totalPages:  Math.ceil(count / limit),
      currentPage: page,
      items:       rows
    });
  } catch (err) {
    console.error('Error al listar beneficiarios:', err);
    res.status(500).json({ error: 'Error al listar beneficiarios' });
  }
});

// Obtener un beneficiario
// GET /beneficiarios/:id
router.get('/:id', async (req, res) => {
  try {
    const ben = await Beneficiario.findByPk(req.params.id, {
      include: [
        {
          model: Familiar,
          as: 'familiares',
          include: [{ model: CatCondicionFamiliar, as: 'condicion', attributes: ['descripcion'] }]
        }
      ]
    });
    if (!ben) return res.status(404).json({ error: 'Beneficiario no encontrado' });
    res.json(ben);
  } catch (error) {
    console.error('Error al obtener beneficiario:', error);
    res.status(500).json({ error: 'Error al obtener beneficiario' });
  }
});

// Actualizar un beneficiario
// PUT /beneficiarios/:id
router.put('/:id', async (req, res) => {
  try {
    const { familiares, ...benData } = req.body;
    // Actualizar datos del beneficiario
    await Beneficiario.update(benData, { where: { id: req.params.id } });

    // Si vienen familiares, reemplazar los existentes
    if (Array.isArray(familiares)) {
      // Eliminar los familiares actuales
      await Familiar.destroy({ where: { beneficiarioId: req.params.id } });
      // Crear nuevos familiares
      const nuevos = familiares.map(f => ({
        nombre: f.nombre,
        dni: f.dni,
        fecha_nacimiento: f.fecha_nac,
        escolaridad: f.escolaridad,
        vinculo: f.vinculo,
        condicionId: f.condicion_id,
        beneficiarioId: req.params.id
      }));
      await Familiar.bulkCreate(nuevos);
    }

    // Devolver el registro actualizado
    const actualizado = await Beneficiario.findByPk(req.params.id, {
      include: [
        {
          model: Familiar,
          as: 'familiares',
          include: [{ model: CatCondicionFamiliar, as: 'condicion', attributes: ['descripcion'] }]
        }
      ]
    });
    res.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar beneficiario:', error);
    res.status(500).json({ error: 'Error al actualizar beneficiario' });
  }
});
// DELETE /beneficiarios/:id
router.delete('/:id', async (req, res) => {
  try {
    // Eliminar familiares asociados
    await Familiar.destroy({ where: { beneficiarioId: req.params.id } });
    // Eliminar beneficiario
    const deleted = await Beneficiario.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Beneficiario no encontrado' });
    res.json({ message: 'Beneficiario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar beneficiario:', error);
    res.status(500).json({ error: 'Error al eliminar beneficiario' });
  }
});
module.exports = router;
