const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Entrega = sequelize.define('entrega', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  beneficiario_id: { type: DataTypes.INTEGER },
  programa_id: { type: DataTypes.INTEGER, defaultValue: 1 },
  fecha_entrega: { type: DataTypes.DATEONLY, allowNull: false },
  producto_id: { type: DataTypes.INTEGER },
  cantidad: DataTypes.INTEGER,
  detalles: DataTypes.TEXT,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, { tableName: 'entrega', timestamps: false });
module.exports = Entrega;