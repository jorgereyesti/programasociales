const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const Beneficiario = require('../models/Beneficiario');
const Familiar = require('../models/Familiar');

router.post('/', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const data = req.body;
    // Crear beneficiario
    const ben = await Beneficiario.create({
      cic_id: data.cic_id,
      fecha_relevamiento: data.fecha_relevamiento,
      nombre: data.nombre,
      dni: data.dni,
      telefono: data.telefono,
      direccion: data.direccion,
      lena_social: data.lena_social,
      actividades_cic: data.actividades_cic,
      ingresos_formales: data.ingresos_formales,
      huerta: data.huerta,
      mantenimiento_economico_id: data.mantenimiento_economico_id,
      observaciones: data.observaciones
    }, { transaction: t });

    // Crear familiares
    for (const fam of data.integrantes || []) {
      await Familiar.create({
        beneficiario_id: ben.id,
        nombre: fam.nombre,
        dni: fam.dni,
        fecha_nacimiento: fam.fecha_nac,
        escolaridad: fam.escolaridad,
        vinculo: fam.vinculo,
        condicion_id: fam.condicion_id
      }, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: 'Registro exitoso' });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;