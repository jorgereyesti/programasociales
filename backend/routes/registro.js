const express = require('express');
const router = express.Router();
const { sequelize, Beneficiario, Familiar } = require('../models');
const { Op } = require('sequelize');

// Middleware de validación
const validateRegistro = async (req, res, next) => {
  const errors = [];
  const data = req.body;

  try {
    // 1. Validar DNI único del beneficiario
    const existingBeneficiario = await Beneficiario.findOne({
      where: { dni: data.dni }
    });
    
    if (existingBeneficiario) {
      errors.push({
        field: 'dni',
        message: `El DNI ${data.dni} ya está registrado para ${existingBeneficiario.nombre}`
      });
    }

    // 2. Validar formato DNI (7-8 dígitos)
    if (!/^\d{7,8}$/.test(data.dni)) {
      errors.push({
        field: 'dni',
        message: 'El DNI debe tener entre 7 y 8 dígitos'
      });
    }

    // 3. Validar fecha de relevamiento no futura
    const fechaRelevamiento = new Date(data.fecha_relevamiento);
    if (fechaRelevamiento > new Date()) {
      errors.push({
        field: 'fecha_relevamiento',
        message: 'La fecha de relevamiento no puede ser futura'
      });
    }

    // 4. Validar teléfono (formato argentino)
    if (data.telefono && !/^(\+54\s?)?(\d{2,4}\s?)?\d{6,8}$/.test(data.telefono.replace(/\s/g, ''))) {
      errors.push({
        field: 'telefono',
        message: 'Formato de teléfono inválido'
      });
    }

    // 5. Validar familiares
    if (data.integrantes && Array.isArray(data.integrantes)) {
      const dnisFamiliares = new Set();
      
      for (let i = 0; i < data.integrantes.length; i++) {
        const familiar = data.integrantes[i];
        
        // Validar DNI único dentro del grupo familiar
        if (dnisFamiliares.has(familiar.dni)) {
          errors.push({
            field: `integrantes[${i}].dni`,
            message: `DNI ${familiar.dni} duplicado en el grupo familiar`
          });
        }
        dnisFamiliares.add(familiar.dni);

        // Validar formato DNI familiar
        if (!/^\d{7,8}$/.test(familiar.dni)) {
          errors.push({
            field: `integrantes[${i}].dni`,
            message: `DNI del familiar ${familiar.nombre} debe tener entre 7 y 8 dígitos`
          });
        }

        // Validar coherencia edad-condición
        if (familiar.fecha_nac && familiar.condicion_id) {
          const edad = calcularEdad(familiar.fecha_nac);
          
          // Asumiendo IDs de condiciones: 1=Adulto Mayor, 2=Discapacidad, 3=Menor de Edad
          if (familiar.condicion_id === 3 && edad >= 18) {
            errors.push({
              field: `integrantes[${i}].condicion`,
              message: `${familiar.nombre} tiene ${edad} años y no puede ser registrado como Menor de Edad`
            });
          }
          
          if (familiar.condicion_id === 1 && edad < 60) {
            errors.push({
              field: `integrantes[${i}].condicion`,
              message: `${familiar.nombre} tiene ${edad} años y no puede ser registrado como Adulto Mayor`
            });
          }
        }
      }
    }

    // Si hay errores, retornar
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Errores de validación',
        details: errors
      });
    }

    next();
  } catch (error) {
    console.error('Error en validación:', error);
    res.status(500).json({ error: 'Error al validar datos' });
  }
};

// Función auxiliar para calcular edad
function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  const fechaNac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }
  
  return edad;
}

// Aplicar middleware a la ruta POST
router.post('/', validateRegistro, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const data = req.body;
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
    res.status(201).json({ 
      message: 'Registro exitoso',
      beneficiario: ben 
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    
    // Manejo específico de error de duplicado de Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Error de duplicado',
        details: [{
          field: 'dni',
          message: 'El DNI ya está registrado en el sistema'
        }]
      });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;