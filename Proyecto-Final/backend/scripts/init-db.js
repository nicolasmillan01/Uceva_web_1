
import 'dotenv/config';

import { db } from '../src/config/database.js';

try {
  console.log('Inicializando EventApp...');

  // database.js crea las tablas y ejecuta
  // las migraciones existentes al importarse.
  const tablas = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();

  console.log('Base de datos inicializada.');

  console.log('Tablas disponibles:');

  for (const tabla of tablas) {
    console.log(`- ${tabla.name}`);
  }

  const requeridas = [
    'users',
    'countries',
    'departments',
    'cities',
    'events'
  ];

  const existentes = new Set(
    tablas.map(tabla => tabla.name)
  );

  const faltantes = requeridas.filter(
    nombre => !existentes.has(nombre)
  );

  if (faltantes.length > 0) {
    throw new Error(
      `Faltan tablas: ${faltantes.join(', ')}`
    );
  }

  console.log(
    'Inicialización completada correctamente.'
  );

} catch (error) {
  console.error(
    'Error al inicializar:',
    error.message
  );

  process.exitCode = 1;

} finally {
  db.close();
}
