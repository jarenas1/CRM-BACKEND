const { Op } = require('sequelize');
const { Company, Contact, Quotation, Agreement } = require('../models');

module.exports = {
  list: (busqueda) => {
    const where = {};
    if (busqueda) where.empresa = { [Op.iLike]: `%${busqueda}%` };
    return Company.findAll({
      where,
      order: [['empresa', 'ASC']],
      include: [{ model: Contact, as: 'contactos' }],
    });
  },
  findByName: (empresa) => Company.findOne({ where: { empresa } }),
  findById: (id) => Company.findByPk(id, { include: [{ model: Contact, as: 'contactos' }] }),
  create: (data) => Company.create(data),
  update: (id, data) => Company.update(data, { where: { id } }),
  ensureExists: async (nombre, datos = {}) => {
    if (!nombre || !nombre.trim()) return null;
    const existing = await Company.findOne({ where: { empresa: nombre.trim() } });
    if (existing) return existing;
    return Company.create({
      empresa: nombre.trim(),
      razonSocial: datos.razonSocial || null,
      nit: datos.nit || null,
      ciudad: datos.ciudad || null,
      notas: datos.notas || 'Creada automáticamente al generar un documento',
    });
  },
  countDocsByCompany: async () => {
    const cots = await Quotation.findAll({ attributes: ['empresa'], raw: true });
    const convs = await Agreement.findAll({ attributes: ['empresa'], raw: true });
    const map = {};
    cots.forEach((c) => {
      const k = (c.empresa || '').toLowerCase();
      map[k] = map[k] || { cot: 0, cnv: 0 };
      map[k].cot += 1;
    });
    convs.forEach((c) => {
      const k = (c.empresa || '').toLowerCase();
      map[k] = map[k] || { cot: 0, cnv: 0 };
      map[k].cnv += 1;
    });
    return map;
  },
};
