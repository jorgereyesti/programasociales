const express = require('express');
const router = express.Router();
const { Cic, Beneficiario, Familiar, CatCondicionFamiliar } = require('../models');

//validacion asincrona
router.get('/check-dni', async (req, res) => {
  try {
    const { dni, excludeId } = req.query;
    
    if (!dni) {
      return res.status(400).json({ error: 'DNI es requerido' });
    }
    
    const where = { dni };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    
    const beneficiario = await Beneficiario.findOne({ 
      where,
      attributes: ['id', 'nombre', 'dni']
    });
    
    res.json({
      exists: !!beneficiario,
      beneficiario: beneficiario || null
    });
  } catch (error) {
    console.error('Error verificando DNI:', error);
    res.status(500).json({ error: 'Error al verificar DNI' });
  }
});
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
//VALIDACIONES
const validateUpdate = async (req, res, next) => {
  const { id } = req.params;
  const { familiares, ...benData } = req.body;
  const errors = [];

  try {
    // Verificar si el beneficiario existe
    const beneficiario = await Beneficiario.findByPk(id);
    if (!beneficiario) {
      return res.status(404).json({ error: 'Beneficiario no encontrado' });
    }

    // Si se está actualizando el DNI, verificar que no exista
    if (benData.dni && benData.dni !== beneficiario.dni) {
      const existingDNI = await Beneficiario.findOne({
        where: { 
          dni: benData.dni,
          id: { [Op.ne]: id } // Excluir el registro actual
        }
      });
      
      if (existingDNI) {
        errors.push({
          field: 'dni',
          message: `El DNI ${benData.dni} ya está registrado para ${existingDNI.nombre}`
        });
      }
    }

    // Validar familiares si se envían
    if (familiares && Array.isArray(familiares)) {
      const dnisFamiliares = new Set();
      
      for (let i = 0; i < familiares.length; i++) {
        const familiar = familiares[i];
        
        // Verificar DNIs duplicados en el grupo
        if (dnisFamiliares.has(familiar.dni)) {
          errors.push({
            field: `familiares[${i}].dni`,
            message: `DNI ${familiar.dni} duplicado en el grupo familiar`
          });
        }
        dnisFamiliares.add(familiar.dni);

        // Verificar que el DNI del familiar no sea igual al del beneficiario
        if (familiar.dni === (benData.dni || beneficiario.dni)) {
          errors.push({
            field: `familiares[${i}].dni`,
            message: `El familiar ${familiar.nombre} no puede tener el mismo DNI que el beneficiario`
          });
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Errores de validación',
        details: errors
      });
    }

    next();
  } catch (error) {
    console.error('Error en validación de actualización:', error);
    res.status(500).json({ error: 'Error al validar datos' });
  }
};
// Actualizar un beneficiario
// PUT /beneficiarios/:id
router.put('/:id', validateUpdate, async (req, res) => {
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
