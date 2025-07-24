const express = require('express');
const router = express.Router();
const { fn, col } = require('sequelize');
const {
  Cic,
  Beneficiario,
  Familiar,
  ProgramaSocial,
  Producto,
  Entrega
} = require('../models');

// GET /dashboard - estadísticas del dashboard
router.get('/', async (req, res) => {
  try {
    // Total de familias registradas
    const totalFamilias = await Beneficiario.count();
    console.log("total familias: " + totalFamilias);
    // Familias beneficiadas (al menos una entrega)
    const familiasBeneficiadas = await Entrega.count({
      distinct: true,
      col: 'beneficiario_id'
    });

    // Personas atendidas: contar familiares de beneficiarios con entrega + beneficiarios
    const personasAtendidas = await Familiar.count({
      include: [{
        model: Beneficiario,
        as: 'beneficiario',
        required: true,
        attributes: [],
        include: [{ model: Entrega, as: 'entregas', required: true, attributes: [] }]
      }]
    });

    // Cobertura (%) y familias sin entrega
    const coberturaPorcentaje = totalFamilias > 0
      ? parseFloat(((familiasBeneficiadas / totalFamilias) * 100).toFixed(2))
      : 0;
    const familiasSinEntrega = totalFamilias - familiasBeneficiadas;

    // Tendencia mensual de entregas (MySQL DATE_FORMAT)
    const rawMonthly = await Entrega.findAll({
      attributes: [
        [fn('date_format', col('fecha_entrega'), '%Y-%m'), 'mes'],
        [fn('count', col('id')), 'entregas']
      ],
      group: [fn('date_format', col('fecha_entrega'), '%Y-%m')],
      order: [[fn('date_format', col('fecha_entrega'), '%Y-%m'), 'ASC']],
      raw: true
    });
    const monthlyTrend = rawMonthly.map(r => ({
      mes: r.mes,
      entregas: parseInt(r.entregas, 10)
    }));

    // Productos distribuidos
    const rawProducts = await Entrega.findAll({
      attributes: [
        [col('producto.nombre'), 'producto'],
        [fn('sum', col('cantidad')), 'cantidad']
      ],
      include: [{ model: Producto, as: 'producto', attributes: [] }],
      group: [col('producto.nombre')],
      raw: true
    });
    const productsTrend = rawProducts.map(r => ({
      producto: r.producto,
      cantidad: parseInt(r.cantidad, 10)
    }));

    // Ranking por CIC (entrega -> beneficiario -> cic)
    const rawRanking = await Entrega.findAll({
      attributes: [
        [col('beneficiario.cic.nombre'), 'cic'],
        [fn('count', col('entrega.id')), 'entregas'],
        [fn('count', fn('DISTINCT', col('entrega.beneficiario_id'))), 'familias']
      ],
      include: [{
        model: Beneficiario,
        as: 'beneficiario',
        attributes: [],
        include: [{ model: Cic, as: 'cic', attributes: [] }]
      }],
      group: [col('beneficiario.cic.nombre')],
      order: [[fn('count', col('entrega.id')), 'DESC']],
      raw: true
    });
    const rankingCIC = rawRanking.map(r => ({ cic: r.cic, entregas: parseInt(r.entregas, 10), familias: parseInt(r.familias, 10) }));

    return res.json({
      familiasBeneficiadas,
      personasAtendidas,
      coberturaPorcentaje,
      familiasSinEntrega,
      monthlyTrend,
      productsTrend,
      rankingCIC
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
});

module.exports = router; 
