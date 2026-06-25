const { Op } = require('sequelize');
const { Quotation } = require('../models');

module.exports = {
  list: ({ limit = 30, offset = 0 } = {}) => Quotation.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  }),
  findByNumero: (numero) => Quotation.findOne({ where: { numero } }),
  search: (q) => Quotation.findAll({
    where: {
      [Op.or]: [
        { numero: { [Op.iLike]: `%${q}%` } },
        { empresa: { [Op.iLike]: `%${q}%` } },
        { contacto: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
      ],
    },
    order: [['createdAt', 'DESC']],
    limit: 25,
  }),
  count: () => Quotation.count(),
  create: (data) => Quotation.create(data),
  update: (id, data) => Quotation.update(data, { where: { id } }),
  findAll: () => Quotation.findAll({ raw: true }),
};
