const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ProduccionPanaderia = sequelize.define('produccion_panaderia', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fecha:        { type: DataTypes.DATEONLY, allowNull: false },
  producto_id: { type: DataTypes.INTEGER },
  cantidad: DataTypes.INTEGER,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, { tableName: 'produccion_panaderia', timestamps: false });
module.exports = ProduccionPanaderia;