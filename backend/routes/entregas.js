const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Entrega, Beneficiario, Producto, ProgramaSocial, Cic, sequelize } = require('../models');

//Validaciones asincronas
router.get('/check-limit', async (req, res) => {
  try {
    const { beneficiario_id, fecha } = req.query;
    
    if (!beneficiario_id || !fecha) {
      return res.status(400).json({ 
        error: 'Beneficiario y fecha son requeridos' 
      });
    }
    
    const count = await Entrega.count({
      where: {
        beneficiario_id,
        fecha_entrega: fecha
      }
    });
    
    const limit = 3; // Límite configurable
    
    res.json({
      count,
      limit,
      hasReachedLimit: count >= limit,
      remaining: Math.max(0, limit - count)
    });
  } catch (error) {
    console.error('Error verificando límite:', error);
    res.status(500).json({ error: 'Error al verificar límite de entregas' });
  }
});
//VALIDACIONES
const validateEntrega = async (req, res, next) => {
  const { beneficiario_id, fecha_entrega, producto_id, cantidad } = req.body;
  const errors = [];

  try {
    // 1. Verificar que el beneficiario existe
    const beneficiario = await Beneficiario.findByPk(beneficiario_id);
    if (!beneficiario) {
      errors.push({
        field: 'beneficiario_id',
        message: 'Beneficiario no encontrado'
      });
    }

    // 2. Verificar que el producto existe
    const producto = await Producto.findByPk(producto_id);
    if (!producto) {
      errors.push({
        field: 'producto_id',
        message: 'Producto no encontrado'
      });
    }

    // 3. Validar cantidad positiva
    if (cantidad <= 0) {
      errors.push({
        field: 'cantidad',
        message: 'La cantidad debe ser mayor a 0'
      });
    }

    // 4. Verificar entregas duplicadas en el mismo día
    const entregaExistente = await Entrega.findOne({
      where: {
        beneficiario_id,
        producto_id,
        fecha_entrega
      }
    });

    if (entregaExistente) {
      errors.push({
        field: 'fecha_entrega',
        message: `Ya existe una entrega de ${producto?.nombre} para este beneficiario en la fecha ${fecha_entrega}`
      });
    }

    // 5. Validar fecha no futura
    if (new Date(fecha_entrega) > new Date()) {
      errors.push({
        field: 'fecha_entrega',
        message: 'La fecha de entrega no puede ser futura'
      });
    }

    // 6. Límite de entregas por día (opcional)
    const entregasDelDia = await Entrega.count({
      where: {
        beneficiario_id,
        fecha_entrega
      }
    });

    if (entregasDelDia >= 3) {
      errors.push({
        field: 'fecha_entrega',
        message: 'El beneficiario ya tiene el máximo de entregas permitidas para este día (3)'
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Errores de validación',
        details: errors
      });
    }

    next();
  } catch (error) {
    console.error('Error en validación de entrega:', error);
    res.status(500).json({ error: 'Error al validar entrega' });
  }
};

// Validación para entregas masivas
const validateEntregaMasiva = async (req, res, next) => {
  const { beneficiarios_ids, fecha_entrega, producto_id, cantidad, cic_id } = req.body;
  const errors = [];

  try {
    // Validaciones básicas
    if (!Array.isArray(beneficiarios_ids) || beneficiarios_ids.length === 0) {
      errors.push({
        field: 'beneficiarios_ids',
        message: 'Debe seleccionar al menos un beneficiario'
      });
    }

    if (cantidad <= 0) {
      errors.push({
        field: 'cantidad',
        message: 'La cantidad debe ser mayor a 0'
      });
    }

    if (new Date(fecha_entrega) > new Date()) {
      errors.push({
        field: 'fecha_entrega',
        message: 'La fecha de entrega no puede ser futura'
      });
    }

    // Verificar que todos los beneficiarios existen y pertenecen al CIC
    if (beneficiarios_ids.length > 0) {
      const beneficiariosValidos = await Beneficiario.findAll({
        where: {
          id: { [Op.in]: beneficiarios_ids },
          ...(cic_id && { cic_id })
        }
      });

      if (beneficiariosValidos.length !== beneficiarios_ids.length) {
        errors.push({
          field: 'beneficiarios_ids',
          message: 'Algunos beneficiarios no existen o no pertenecen al CIC seleccionado'
        });
      }

      // Verificar entregas duplicadas para cada beneficiario
      const entregasExistentes = await Entrega.findAll({
        where: {
          beneficiario_id: { [Op.in]: beneficiarios_ids },
          producto_id,
          fecha_entrega
        },
        attributes: ['beneficiario_id'],
        include: [{
          model: Beneficiario,
          as: 'beneficiario',
          attributes: ['nombre']
        }]
      });

      if (entregasExistentes.length > 0) {
        const nombres = entregasExistentes.map(e => e.beneficiario.nombre).join(', ');
        errors.push({
          field: 'beneficiarios_ids',
          message: `Los siguientes beneficiarios ya tienen entregas registradas para este producto en la fecha seleccionada: ${nombres}`
        });
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
    console.error('Error en validación de entrega masiva:', error);
    res.status(500).json({ error: 'Error al validar entrega masiva' });
  }
};
// GET /entregas with pagination & filters
router.get('/', async (req, res) => {
  try {
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

    const includeDefs = [
      beneficiarioInclude,
      { model: Producto,      as: 'producto' },
      { model: ProgramaSocial,as: 'programa_social' }
    ];

    // Si se solicita 'all=true', devolver todos los registros sin paginación
    if (req.query.all === 'true') {
      const rows = await Entrega.findAll({
        where: entregaWhere,
        include: includeDefs,
        order: [['fecha_entrega', 'DESC']]
      });
      return res.json(rows);
    }

    // Paginación normal
    const page       = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit      = Math.max(parseInt(req.query.limit) || 10,1);
    const sortBy     = req.query.sortBy || 'fecha_entrega';
    const order      = (req.query.order||'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset     = (page - 1) * limit;

    const { count, rows } = await Entrega.findAndCountAll({
      where: entregaWhere,
      include: includeDefs,
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
router.post('/', validateEntrega, async (req, res) => {
  try {
    const { beneficiario_id, fecha_entrega, producto_id, cantidad, detalles } = req.body;
    const nueva = await Entrega.create({ beneficiario_id, fecha_entrega, producto_id, cantidad, detalles });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear entrega' });
  }
});

// POST /entregas/masiva → crear entregas masivas
router.post('/masiva', validateEntregaMasiva, async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { 
      beneficiarios_ids, // array de IDs
      fecha_entrega, 
      producto_id, 
      cantidad, 
      detalles,
      cic_id // opcional, para validar que todos pertenecen al mismo CIC
    } = req.body;

    // Validaciones
    if (!Array.isArray(beneficiarios_ids) || beneficiarios_ids.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar al menos un beneficiario' });
    }

    // Si se proporciona cic_id, validar que todos los beneficiarios pertenezcan a ese CIC
    if (cic_id) {
      const beneficiariosValidos = await Beneficiario.count({
        where: {
          id: { [Op.in]: beneficiarios_ids },
          cic_id: cic_id
        }
      });

      if (beneficiariosValidos !== beneficiarios_ids.length) {
        await t.rollback();
        return res.status(400).json({ 
          error: 'Algunos beneficiarios no pertenecen al CIC seleccionado' 
        });
      }
    }

    // Crear las entregas
    const entregas = beneficiarios_ids.map(ben_id => ({
      beneficiario_id: ben_id,
      fecha_entrega,
      producto_id,
      cantidad,
      detalles: detalles || 'Entrega masiva',
      programa_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    }));

    const resultado = await Entrega.bulkCreate(entregas, { transaction: t });
    
    await t.commit();

    res.status(201).json({ 
      message: 'Entregas masivas registradas exitosamente',
      cantidad: resultado.length,
      entregas: resultado
    });

  } catch (error) {
    await t.rollback();
    console.error('Error en entregas masivas:', error);
    res.status(500).json({ error: 'Error al procesar entregas masivas' });
  }
});

// GET /entregas/beneficiarios-cic/:cicId → obtener beneficiarios de un CIC
router.get('/beneficiarios-cic/:cicId', async (req, res) => {
  try {
    const beneficiarios = await Beneficiario.findAll({
      where: { cic_id: req.params.cicId },
      attributes: ['id', 'nombre', 'dni'],
      order: [['nombre', 'ASC']]
    });
    
    res.json(beneficiarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener beneficiarios del CIC' });
  }
});

module.exports = router;