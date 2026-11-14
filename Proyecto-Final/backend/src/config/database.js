import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const dataDir = resolve('data');
mkdirSync(dataDir, { recursive: true });
export const db = new DatabaseSync(resolve(dataDir, 'eventapp.sqlite'));
db.exec(`PRAGMA foreign_keys = ON;
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
);`);
