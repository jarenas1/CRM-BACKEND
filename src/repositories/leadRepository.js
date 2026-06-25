const { Op } = require('sequelize');
const { Lead, Interaction, User } = require('../models');

module.exports = {
  list: async (filtros = {}) => {
    const where = {};
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.interes) where.interes = filtros.interes;
    if (filtros.asignadoId && filtros.asignadoId !== 'all') where.asignadoId = filtros.asignadoId;
    if (filtros.busqueda) {
      const q = `%${filtros.busqueda}%`;
      where[Op.or] = [
        { nombre: { [Op.iLike]: q } },
        { empresa: { [Op.iLike]: q } },
        { email: { [Op.iLike]: q } },
        { telefono: { [Op.iLike]: q } },
      ];
    }
    return Lead.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'asignado', attributes: ['id', 'username', 'name'] },
        { model: User, as: 'creador', attributes: ['id', 'username', 'name'] },
      ],
    });
  },
  findById: (id) => Lead.findByPk(id, {
    include: [
      { model: User, as: 'asignado', attributes: ['id', 'username', 'name'] },
      { model: Interaction, as: 'interacciones', order: [['createdAt', 'DESC']] },
    ],
  }),
  create: (data) => Lead.create(data),
  update: (id, data) => Lead.update(data, { where: { id } }),
  remove: (id) => Lead.destroy({ where: { id } }),
  count: () => Lead.count(),
  findAll: () => Lead.findAll({ raw: true }),
};
