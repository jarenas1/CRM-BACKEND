const { User } = require('../models');

module.exports = {
  findAll: (where = {}) => User.findAll({ where, order: [['createdAt', 'DESC']] }),
  findById: (id) => User.findByPk(id),
  findByUsername: (username) => User.findOne({ where: { username } }),
  findActive: () => User.findAll({ where: { active: true }, attributes: ['id', 'username', 'name', 'role'] }),
  create: (data) => User.create(data),
  update: (id, data) => User.update(data, { where: { id } }),
  remove: (id) => User.destroy({ where: { id } }),
};
