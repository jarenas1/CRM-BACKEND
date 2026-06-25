const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agreement = sequelize.define('Agreement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  numero: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  empresa: { type: DataTypes.STRING(220) },
  contacto: { type: DataTypes.STRING(180) },
  cargo: { type: DataTypes.STRING(180) },
  email: { type: DataTypes.STRING(180) },
  telefono: { type: DataTypes.STRING(60) },
  tarifaSencilla: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
  tarifaDoble: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
  tarifaSuite: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
  personaAdicional: { type: DataTypes.DECIMAL(14, 2), defaultValue: 120000 },
  vigenciaHasta: { type: DataTypes.DATEONLY },
  fechasRestringidas: { type: DataTypes.STRING(255) },
  estado: { type: DataTypes.STRING(40), defaultValue: 'Borrador' },
  proximoSeguimiento: { type: DataTypes.DATEONLY },
  mensajePersonalizado: { type: DataTypes.TEXT },
  emailCC: { type: DataTypes.STRING(255) },
  generadoPorId: { type: DataTypes.UUID },
  generadoPorNombre: { type: DataTypes.STRING(180) },
}, {
  tableName: 'agreements',
});

module.exports = Agreement;
