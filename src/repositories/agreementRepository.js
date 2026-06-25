const { Op } = require('sequelize');
const { Agreement } = require('../models');

module.exports = {
  list: ({ limit = 30, offset = 0 } = {}) => Agreement.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  }),
  findByNumero: (numero) => Agreement.findOne({ where: { numero } }),
  search: (q) => Agreement.findAll({
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
  count: () => Agreement.count(),
  create: (data) => Agreement.create(data),
  update: (id, data) => Agreement.update(data, { where: { id } }),
  findAll: () => Agreement.findAll({ raw: true }),
};
