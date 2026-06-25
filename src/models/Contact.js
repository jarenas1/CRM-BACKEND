const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nombre: { type: DataTypes.STRING(180), allowNull: false },
  cargo: { type: DataTypes.STRING(180) },
  email: { type: DataTypes.STRING(180) },
  telefono: { type: DataTypes.STRING(60) },
  companyId: { type: DataTypes.UUID },
}, {
  tableName: 'contacts',
});

module.exports = Contact;
