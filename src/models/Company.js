const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  empresa: { type: DataTypes.STRING(220), allowNull: false, unique: true },
  razonSocial: { type: DataTypes.STRING(220) },
  nit: { type: DataTypes.STRING(60) },
  ciudad: { type: DataTypes.STRING(120) },
  emailFacturacion: { type: DataTypes.STRING(180) },
  direccion: { type: DataTypes.STRING(255) },
  notas: { type: DataTypes.TEXT },
}, {
  tableName: 'companies',
});

module.exports = Company;
