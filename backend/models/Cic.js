const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cic = sequelize.define('cic', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, unique: true }
}, { tableName: 'cic', timestamps: false });
module.exports = Cic;
