require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const env = require('../config/env');
const { User, Company, Contact, Lead } = require('../models');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: false });

  const exists = await User.findOne({ where: { username: env.admin.username } });
  if (!exists) {
    await User.create({
      username: env.admin.username,
      name: env.admin.name,
      email: 'arenas.pipe@hotmail.com',
      cargo: env.admin.cargo,
      role: 'admin',
      passwordHash: await bcrypt.hash(env.admin.password, 10),
      active: true,
    });
    console.log(`✓ Admin creado: ${env.admin.username}`);
  } else {
    // Asegura el email del admin
    if (exists.email !== 'arenas.pipe@hotmail.com') {
      exists.email = 'arenas.pipe@hotmail.com';
      await exists.save();
      console.log('✓ Email del admin actualizado a arenas.pipe@hotmail.com');
    } else {
      console.log('✓ Admin ya existe con email correcto');
    }
  }

  const eExists = await User.findOne({ where: { username: 'ejecutivo' } });
  if (!eExists) {
    await User.create({
      username: 'ejecutivo',
      name: 'Ejecutivo de Ventas',
      email: 'mercadoflashecom@gmail.com',
      cargo: 'Asesor Comercial',
      role: 'ejecutivo',
      passwordHash: await bcrypt.hash('Ejecutivo2026*', 10),
      active: true,
    });
    console.log('✓ Ejecutivo demo creado: ejecutivo / Ejecutivo2026*');
  } else if (eExists.email !== 'mercadoflashecom@gmail.com') {
    eExists.email = 'mercadoflashecom@gmail.com';
    await eExists.save();
    console.log('✓ Email del ejecutivo actualizado a mercadoflashecom@gmail.com');
  }

  const dummy = await Company.findOne({ where: { empresa: 'Empresa Demo S.A.S.' } });
  if (!dummy) {
    const c = await Company.create({
      empresa: 'Empresa Demo S.A.S.',
      razonSocial: 'Empresa Demo S.A.S.',
      nit: '900000000-1',
      ciudad: 'Medellín',
      emailFacturacion: 'facturacion@empresademo.com',
      direccion: 'Calle 10 #20-30',
      notas: 'Empresa de prueba',
    });
    await Contact.create({
      companyId: c.id,
      nombre: 'María González',
      cargo: 'Gerente Administrativa',
      email: 'maria@empresademo.com',
      telefono: '+57 300 000 0000',
    });
    console.log('✓ Empresa demo creada');
  }

  console.log('🌱 Seed completado');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
