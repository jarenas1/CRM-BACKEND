const { Op } = require('sequelize');
const { Reservation } = require('../models');

module.exports = {
  list: ({ limit = 30, offset = 0 } = {}) => Reservation.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  }),
  findByNumero: (numero) => Reservation.findOne({ where: { numero } }),
  findById: (id) => Reservation.findByPk(id),
  search: (q) => Reservation.findAll({
    where: {
      [Op.or]: [
        { numero: { [Op.iLike]: `%${q}%` } },
        { codigoReserva: { [Op.iLike]: `%${q}%` } },
        { titular: { [Op.iLike]: `%${q}%` } },
        { empresa: { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
      ],
    },
    order: [['createdAt', 'DESC']],
    limit: 25,
  }),
  count: () => Reservation.count(),
  create: (data) => Reservation.create(data),
  update: (id, data) => Reservation.update(data, { where: { id } }),
};
