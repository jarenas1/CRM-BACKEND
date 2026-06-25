const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quotation = sequelize.define('Quotation', {
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
  tipoCotizacion: { type: DataTypes.STRING(80) },
  moneda: { type: DataTypes.STRING(8), defaultValue: 'COP' },
  trmReferencia: { type: DataTypes.DECIMAL(14, 2) },
  fechaCaducidad: { type: DataTypes.DATEONLY },
  referencia: { type: DataTypes.STRING(180) },
  subtotal: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
  impuestoServicio: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
  iva: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
  estado: { type: DataTypes.STRING(40), defaultValue: 'Borrador' },
  proximoSeguimiento: { type: DataTypes.DATEONLY },
  items: { type: DataTypes.JSONB, defaultValue: [] },
  mensajePersonalizado: { type: DataTypes.TEXT },
  emailCC: { type: DataTypes.STRING(255) },
  generadoPorId: { type: DataTypes.UUID },
  generadoPorNombre: { type: DataTypes.STRING(180) },
}, {
  tableName: 'quotations',
});

module.exports = Quotation;
