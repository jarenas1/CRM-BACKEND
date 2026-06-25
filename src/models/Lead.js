const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tipo: { type: DataTypes.STRING(40), defaultValue: 'Empresa' },
  nombre: { type: DataTypes.STRING(180) },
  empresa: { type: DataTypes.STRING(220) },
  cargo: { type: DataTypes.STRING(180) },
  email: { type: DataTypes.STRING(180) },
  telefono: { type: DataTypes.STRING(60) },
  ciudad: { type: DataTypes.STRING(120) },
  origen: { type: DataTypes.STRING(80), defaultValue: 'Otro' },
  interes: { type: DataTypes.STRING(80), defaultValue: 'Hospedaje' },
  estado: { type: DataTypes.STRING(40), defaultValue: 'Nuevo' },
  valor: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
  proximaAccion: { type: DataTypes.DATEONLY },
  notas: { type: DataTypes.TEXT },
  asignadoId: { type: DataTypes.UUID },
  creadorId: { type: DataTypes.UUID },
}, {
  tableName: 'leads',
});

module.exports = Lead;
