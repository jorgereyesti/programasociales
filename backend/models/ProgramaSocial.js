const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ProgramaSocial = sequelize.define('programa_social', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: { type: DataTypes.STRING, unique: true },
  nombre: DataTypes.STRING,
  descripcion: DataTypes.TEXT,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, { tableName: 'programa_social', timestamps: false });
module.exports = ProgramaSocial;