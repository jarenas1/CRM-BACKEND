const sequelize = require('../config/database');
const User = require('./User');
const Company = require('./Company');
const Contact = require('./Contact');
const Lead = require('./Lead');
const Interaction = require('./Interaction');
const Quotation = require('./Quotation');
const Agreement = require('./Agreement');
const Reservation = require('./Reservation');

// Relaciones
Company.hasMany(Contact, { foreignKey: 'companyId', as: 'contactos', onDelete: 'CASCADE' });
Contact.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

Lead.hasMany(Interaction, { foreignKey: 'leadId', as: 'interacciones', onDelete: 'CASCADE' });
Interaction.belongsTo(Lead, { foreignKey: 'leadId', as: 'lead' });

User.hasMany(Lead, { foreignKey: 'asignadoId', as: 'leadsAsignados' });
Lead.belongsTo(User, { foreignKey: 'asignadoId', as: 'asignado' });
Lead.belongsTo(User, { foreignKey: 'creadorId', as: 'creador' });

User.hasMany(Quotation, { foreignKey: 'generadoPorId', as: 'cotizaciones' });
Quotation.belongsTo(User, { foreignKey: 'generadoPorId', as: 'generadoPor' });

User.hasMany(Agreement, { foreignKey: 'generadoPorId', as: 'convenios' });
Agreement.belongsTo(User, { foreignKey: 'generadoPorId', as: 'generadoPor' });

User.hasMany(Reservation, { foreignKey: 'generadoPorId', as: 'reservas' });
Reservation.belongsTo(User, { foreignKey: 'generadoPorId', as: 'generadoPor' });

module.exports = {
  sequelize,
  User,
  Company,
  Contact,
  Lead,
  Interaction,
  Quotation,
  Agreement,
  Reservation,
};
