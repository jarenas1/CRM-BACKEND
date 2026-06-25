const { Sequelize } = require('sequelize');
const env = require('./env');

if (!env.db.url) {
  console.warn('⚠️  DATABASE_URL no está configurada. Configura tu .env antes de iniciar.');
}

const sequelize = new Sequelize(env.db.url, {
  dialect: 'postgres',
  logging: env.nodeEnv === 'development' ? false : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  define: { underscored: false, timestamps: true },
});

module.exports = sequelize;
