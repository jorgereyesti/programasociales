const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const CatCondicionFamiliar = sequelize.define('cat_condicion_familiar', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  codigo: { type: DataTypes.STRING, unique: true },
  descripcion: DataTypes.STRING
}, { tableName: 'cat_condicion_familiar', timestamps: false });
module.exports = CatCondicionFamiliar;