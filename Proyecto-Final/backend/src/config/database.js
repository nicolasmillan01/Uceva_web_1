
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createAuthAndLocationTables } from '../migrations/001_auth_localizacion.js';
import { createReservationsTable } from '../migrations/002_reservations.js';
import { createEventOwnerColumn } from '../migrations/003_event_owner.js';

// Crear la carpeta donde se guardará la base de datos
const dataDir = resolve('data');

mkdirSync(dataDir, { recursive: true });

// Crear o abrir la base de datos SQLite
export const db = new DatabaseSync(
  resolve(dataDir, 'eventapp.sqlite')
);

// Habilitar relaciones entre tablas
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS events (
    codigo INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL DEFAULT '',
    teatro TEXT NOT NULL,
    ciudad TEXT NOT NULL,
    fecha_inicio TEXT NOT NULL,
    fecha_fin TEXT NOT NULL,
    capacidad INTEGER NOT NULL CHECK (capacidad > 0),
    precio REAL NOT NULL CHECK (precio >= 0),
    observaciones TEXT NOT NULL DEFAULT '',
    estado TEXT NOT NULL DEFAULT 'Programado'
  );
`);

// Crear las tablas de países, departamentos,
// ciudades y usuarios
createAuthAndLocationTables(db);

// Crear tabla de reservas
createReservationsTable(db);
// crear  de reservas
createEventOwnerColumn(db);
