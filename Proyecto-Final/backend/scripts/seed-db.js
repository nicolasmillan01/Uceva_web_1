
import 'dotenv/config';

import { db } from '../src/config/database.js';
import { AuthService } from '../src/services/auth.service.js';
import { UserModel } from '../src/models/user.model.js';

// Buscar o crear un país
function ensureCountry(nombre) {
  let pais = db.prepare(`
    SELECT id, nombre
    FROM countries
    WHERE nombre = ? COLLATE NOCASE
  `).get(nombre);

  if (pais) return pais.id;

  const result = db.prepare(`
    INSERT INTO countries (nombre)
    VALUES (?)
  `).run(nombre);

  return Number(result.lastInsertRowid);
}

// Buscar o crear un departamento
function ensureDepartment(nombre, countryId) {
  let departamento = db.prepare(`
    SELECT id
    FROM departments
    WHERE nombre = ? COLLATE NOCASE
      AND country_id = ?
  `).get(nombre, countryId);

  if (departamento) return departamento.id;

  const result = db.prepare(`
    INSERT INTO departments (nombre, country_id)
    VALUES (?, ?)
  `).run(nombre, countryId);

  return Number(result.lastInsertRowid);
}

// Buscar o crear una ciudad
function ensureCity(nombre, departmentId) {
  let ciudad = db.prepare(`
    SELECT id
    FROM cities
    WHERE nombre = ? COLLATE NOCASE
      AND department_id = ?
  `).get(nombre, departmentId);

  if (ciudad) return ciudad.id;

  const result = db.prepare(`
    INSERT INTO cities (nombre, department_id)
    VALUES (?, ?)
  `).run(nombre, departmentId);

  return Number(result.lastInsertRowid);
}

// Registrar usuarios de prueba
async function ensureUser({
  nombre,
  email,
  password,
  rol,
  city_id
}) {
  const existingUser = UserModel.findByEmail(
    email.trim().toLowerCase()
  );

  if (existingUser) {
    console.log(
      `Usuario existente: ${email} (${existingUser.rol})`
    );
    return;
  }

  const usuario = await AuthService.register({
    nombre,
    email,
    password,
    city_id
  });

  // El registro público crea clientes.
  // El script local asigna el rol de prueba.
  if (rol !== 'cliente') {
    UserModel.updateRole(usuario.id, rol);
  }

  console.log(
    `Usuario creado: ${email} (${rol})`
  );
}

async function main() {
  console.log('Ejecutando seed de EventApp...');

  const perfiles = [
    {
      nombre: 'Cliente Prueba',
      email: process.env.SEED_CLIENT_EMAIL,
      password: process.env.SEED_CLIENT_PASSWORD,
      rol: 'cliente'
    },
    {
      nombre: 'Agente Prueba',
      email: process.env.SEED_AGENT_EMAIL,
      password: process.env.SEED_AGENT_PASSWORD,
      rol: 'agente'
    },
    {
      nombre: 'Administrador Prueba',
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
      rol: 'administrador'
    }
  ];

  // Verificar configuración antes de modificar datos
  for (const perfil of perfiles) {
    if (
      !perfil.email ||
      !perfil.password ||
      perfil.password.length < 8 ||
      perfil.password.length > 128
    ) {
      throw new Error(
        `Configura correo y contraseña válidos para ${perfil.rol} en backend/.env`
      );
    }
  }

  const correos = perfiles.map(
    perfil => perfil.email.trim().toLowerCase()
  );

  if (new Set(correos).size !== correos.length) {
    throw new Error(
      'Los correos de los tres perfiles deben ser diferentes'
    );
  }

  // Crear localización inicial
  const countryId = ensureCountry('Colombia');

  const departmentId = ensureDepartment(
    'Valle del Cauca',
    countryId
  );

  const cityId = ensureCity(
    'Tuluá',
    departmentId
  );

  console.log(
    `Localización preparada. Ciudad ID: ${cityId}`
  );

  // Crear usuarios por rol
  for (const perfil of perfiles) {
    await ensureUser({
      ...perfil,
      city_id: cityId
    });
  }

  console.log('Seed completado correctamente.');
}

try {
  await main();
} catch (error) {
  console.error('Error en seed:', error.message);
  process.exitCode = 1;
} finally {
  db.close();
}
