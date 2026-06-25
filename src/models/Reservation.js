const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  numero: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  codigoReserva: { type: DataTypes.STRING(60) },
  titular: { type: DataTypes.STRING(180), allowNull: false },
  empresa: { type: DataTypes.STRING(220), defaultValue: 'PARTICULAR' },
  email: { type: DataTypes.STRING(180) },
  telefono: { type: DataTypes.STRING(60) },
  tipoHabitacion: { type: DataTypes.STRING(120) },
  numeroHabitaciones: { type: DataTypes.INTEGER, defaultValue: 1 },
  numeroHuespedes: { type: DataTypes.INTEGER, defaultValue: 1 },
  noches: { type: DataTypes.INTEGER, defaultValue: 1 },
  fechaLlegada: { type: DataTypes.DATEONLY, allowNull: false },
  fechaSalida: { type: DataTypes.DATEONLY, allowNull: false },
  valorNoche: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },
  aplicaIva: { type: DataTypes.BOOLEAN, defaultValue: true },
  subtotal: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
  iva: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(16, 2), defaultValue: 0 },
  estado: { type: DataTypes.STRING(40), defaultValue: 'Pendiente' },
  observaciones: { type: DataTypes.TEXT },
  generadoPorId: { type: DataTypes.UUID },
  generadoPorNombre: { type: DataTypes.STRING(180) },
}, {
  tableName: 'reservations',
});

module.exports = Reservation;
