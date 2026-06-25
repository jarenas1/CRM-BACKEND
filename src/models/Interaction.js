const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Interaction = sequelize.define('Interaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  leadId: { type: DataTypes.UUID, allowNull: false },
  tipo: { type: DataTypes.STRING(40), defaultValue: 'Nota' },
  descripcion: { type: DataTypes.TEXT },
  resultado: { type: DataTypes.TEXT },
  usuarioId: { type: DataTypes.UUID },
  usuarioNombre: { type: DataTypes.STRING(180) },
}, {
  tableName: 'interactions',
});

module.exports = Interaction;
