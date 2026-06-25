const { Interaction } = require('../models');

module.exports = {
  listByLead: (leadId) => Interaction.findAll({ where: { leadId }, order: [['createdAt', 'DESC']] }),
  create: (data) => Interaction.create(data),
};
