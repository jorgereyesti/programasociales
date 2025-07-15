const sequelize = require('../config/database');
const Beneficiario = require('./Beneficiario');
const Familiar = require('./Familiar');
const Cic = require('./Cic');
const ProgramaSocial = require('./ProgramaSocial');
const CatMantenimientoEconomico = require('./CatMantenimientoEconomico');
const CatCondicionFamiliar = require('./CatCondicionFamiliar');
const Producto = require('./Producto');
const ProduccionPanaderia = require('./ProduccionPanaderia');
const Entrega = require('./Entrega');

// Asociaciones
Beneficiario.belongsTo(Cic, { foreignKey: 'cic_id', as: 'cic' });
Cic.hasMany(Beneficiario, { foreignKey: 'cic_id', as: 'beneficiarios' });

Beneficiario.belongsTo(ProgramaSocial, { foreignKey: 'programa_id', as: 'programa' });
ProgramaSocial.hasMany(Beneficiario, { foreignKey: 'programa_id', as: 'beneficiarios' });
ProgramaSocial.hasMany(Entrega, { foreignKey: 'programa_id', as: 'entregas' });

Beneficiario.belongsTo(CatMantenimientoEconomico, { foreignKey: 'mantenimiento_economico_id', as: 'mantenimientoEconomico' });
CatMantenimientoEconomico.hasMany(Beneficiario, { foreignKey: 'mantenimiento_economico_id', as: 'beneficiarios' });

Beneficiario.hasMany(Familiar, { foreignKey: 'beneficiario_id', as: 'familiares' });
Familiar.belongsTo(Beneficiario, { foreignKey: 'beneficiario_id', as: 'beneficiario' });

Familiar.belongsTo(CatCondicionFamiliar, { foreignKey: 'condicion_id', as: 'condicion' });
CatCondicionFamiliar.hasMany(Familiar, { foreignKey: 'condicion_id', as: 'familiares' });

Producto.hasMany(ProduccionPanaderia, { foreignKey: 'producto_id', as: 'producciones' });
ProduccionPanaderia.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

Producto.hasMany(Entrega, { foreignKey: 'producto_id', as: 'entregas' });
Entrega.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Entrega.belongsTo(ProgramaSocial, {  foreignKey: 'programa_id',  as: 'programa_social'});

Entrega.belongsTo(Beneficiario, { foreignKey: 'beneficiario_id', as: 'beneficiario' });
Beneficiario.hasMany(Entrega, { foreignKey: 'beneficiario_id', as: 'entregas' });

module.exports = {
  sequelize,
  Beneficiario,
  Familiar,
  Cic,
  ProgramaSocial,
  CatMantenimientoEconomico,
  CatCondicionFamiliar,
  Producto,
  ProduccionPanaderia,
  Entrega
};