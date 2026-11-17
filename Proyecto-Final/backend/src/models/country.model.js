
import { db } from '../config/database.js';

export const CountryModel = {

  // Consultar todos los países
  findAll: () => {
    return db.prepare(
      'SELECT id, nombre FROM countries ORDER BY nombre ASC'
    ).all();
  },

  // Consultar un país por su ID
  findById: (id) => {
    return db.prepare(
      'SELECT id, nombre FROM countries WHERE id = ?'
    ).get(id);
  },

  // Crear un país
  create: (nombre) => {
    const result = db.prepare(
      'INSERT INTO countries (nombre) VALUES (?)'
    ).run(nombre);

    return CountryModel.findById(
      Number(result.lastInsertRowid)
    );
  },

  // Actualizar un país
  update: (id, nombre) => {
    const result = db.prepare(
      'UPDATE countries SET nombre = ? WHERE id = ?'
    ).run(nombre, id);

    return result.changes > 0
      ? CountryModel.findById(id)
      : null;
  },

  // Eliminar un país
  delete: (id) => {
    const result = db.prepare(
      'DELETE FROM countries WHERE id = ?'
    ).run(id);

    return result.changes > 0;
  }

};
