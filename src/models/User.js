const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true,
  },
  name: { type: DataTypes.STRING(180), allowNull: false },
  email: { type: DataTypes.STRING(180) },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false },
  role: {
    type: DataTypes.ENUM('admin', 'ejecutivo'),
    allowNull: false,
    defaultValue: 'ejecutivo',
  },
  cargo: { type: DataTypes.STRING(180) },
  telefono: { type: DataTypes.STRING(60) },
  firma: { type: DataTypes.TEXT },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastLogin: { type: DataTypes.DATE },
}, {
  tableName: 'users',
});

module.exports = User;
