const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Producto = sequelize.define('producto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, unique: true }
}, { tableName: 'producto', timestamps: false });
module.exports = Producto;