const { Op } = require('sequelize');
const { Contact, Company } = require('../models');

module.exports = {
  listByCompany: (companyId) => Contact.findAll({ where: { companyId }, order: [['nombre', 'ASC']] }),
  create: (data) => Contact.create(data),
  ensureExists: async ({ empresa, companyId, nombre, cargo, email, telefono }) => {
    if (!nombre && !email) return null;
    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId && empresa) {
      const c = await Company.findOne({ where: { empresa } });
      if (c) resolvedCompanyId = c.id;
    }
    const where = { companyId: resolvedCompanyId };
    if (email) where.email = email;
    else if (nombre) where.nombre = nombre;
    const existing = await Contact.findOne({ where });
    if (existing) return existing;
    return Contact.create({ companyId: resolvedCompanyId, nombre, cargo, email, telefono });
  },
};
