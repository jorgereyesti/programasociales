const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Beneficiario = sequelize.define('beneficiario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cic_id: { type: DataTypes.INTEGER },
  programa_id: { type: DataTypes.INTEGER, defaultValue: 1 },
  fecha_relevamiento: DataTypes.DATE,
  nombre: DataTypes.STRING,
  dni: { type: DataTypes.STRING, unique: true },
  telefono: DataTypes.STRING,
  direccion: DataTypes.STRING,
  lena_social: DataTypes.BOOLEAN,
  actividades_cic: DataTypes.BOOLEAN,
  ingresos_formales: DataTypes.BOOLEAN,
  huerta: DataTypes.BOOLEAN,
  mantenimiento_economico_id: { type: DataTypes.INTEGER },
  observaciones: DataTypes.TEXT,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: 'beneficiario',
  timestamps: false
});

module.exports = Beneficiario;