const companyRepo = require('../repositories/companyRepository');
const contactRepo = require('../repositories/contactRepository');
const leadRepo = require('../repositories/leadRepository');

async function listDirectory(busqueda) {
  const empresas = await companyRepo.list(busqueda);
  const counts = await companyRepo.countDocsByCompany();
  return empresas.map((e) => {
    const plain = e.toJSON ? e.toJSON() : e;
    const k = (plain.empresa || '').toLowerCase();
    return {
      ...plain,
      numCotizaciones: (counts[k] && counts[k].cot) || 0,
      numConvenios: (counts[k] && counts[k].cnv) || 0,
    };
  });
}

async function listNames() {
  const empresas = await companyRepo.list();
  return empresas.map((e) => e.empresa);
}

async function create(data) {
  if (!(data.empresa || '').trim()) return { ok: false, mensaje: 'El nombre de la empresa es obligatorio' };
  const exists = await companyRepo.findByName(data.empresa.trim());
  if (exists) return { ok: false, mensaje: 'Esa empresa ya existe' };
  const c = await companyRepo.create({
    empresa: data.empresa.trim(),
    razonSocial: data.razonSocial || null,
    nit: data.nit || null,
    ciudad: data.ciudad || null,
    emailFacturacion: data.emailFacturacion || null,
    direccion: data.direccion || null,
    notas: data.notas || null,
  });
  return { ok: true, mensaje: 'Empresa guardada', company: c };
}

async function update(id, data) {
  await companyRepo.update(id, data);
  return { ok: true, mensaje: 'Empresa actualizada' };
}

async function importAsLead(companyId, user) {
  const c = await companyRepo.findById(companyId);
  if (!c) return { ok: false, mensaje: 'Empresa no encontrada' };
  const contacto = c.contactos && c.contactos[0];
  const lead = await leadRepo.create({
    tipo: 'Empresa',
    nombre: contacto ? contacto.nombre : '',
    empresa: c.empresa,
    ciudad: c.ciudad,
    email: (contacto && contacto.email) || c.emailFacturacion,
    origen: 'Otro',
    interes: 'Convenio corporativo',
    estado: 'Nuevo',
    notas: 'Importada desde Empresas. ' + (c.notas || ''),
    asignadoId: user.id,
    creadorId: user.id,
  });
  return { ok: true, mensaje: 'Lead creado desde empresa', id: lead.id };
}

module.exports = { listDirectory, listNames, create, update, importAsLead };
