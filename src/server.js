require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const sequelize = require('./config/database');
require('./models');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'vgrand-crm', time: new Date() }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL (Neon)');
    await sequelize.sync({ alter: false });
    console.log('✅ Modelos sincronizados');
    await ensureAdmin();
    app.listen(env.port, () => {
      console.log(`🚀 API V Grand CRM en http://localhost:${env.port}`);
    });
  } catch (e) {
    console.error('❌ Error al iniciar:', e.message);
    process.exit(1);
  }
}

async function ensureAdmin() {
  const bcrypt = require('bcryptjs');
  const { User } = require('./models');
  const count = await User.count();
  if (count === 0) {
    await User.create({
      username: env.admin.username,
      name: env.admin.name,
      email: env.admin.email,
      cargo: env.admin.cargo,
      role: 'admin',
      passwordHash: await bcrypt.hash(env.admin.password, 10),
      active: true,
    });
    console.log(`👤 Usuario admin creado: ${env.admin.username} / ${env.admin.password}`);
  }
}

start();
