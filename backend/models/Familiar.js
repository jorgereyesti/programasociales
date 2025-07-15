const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Familiar = sequelize.define('familiar', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  beneficiario_id: { type: DataTypes.INTEGER },
  nombre: DataTypes.STRING,
  dni: DataTypes.STRING,
  fecha_nacimiento: DataTypes.DATE,
  escolaridad: DataTypes.BOOLEAN,
  vinculo: DataTypes.STRING,
  condicion_id: { type: DataTypes.INTEGER },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
}, {
  tableName: 'familiar',
  timestamps: false
});

module.exports = Familiar;
