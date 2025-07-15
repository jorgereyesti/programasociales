const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const CatMantenimientoEconomico = sequelize.define('cat_mantenimiento_economico', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: { type: DataTypes.STRING, unique: true },
  descripcion: DataTypes.STRING
}, { tableName: 'cat_mantenimiento_economico', timestamps: false });
module.exports = CatMantenimientoEconomico;