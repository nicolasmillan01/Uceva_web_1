
import { db } from '../config/database.js';

export const DepartmentModel = {

  // Consultar todos los departamentos
  findAll() {
    return db.prepare(`
      SELECT
        d.id,
        d.nombre,
        d.country_id,
        c.nombre AS pais
      FROM departments d
      INNER JOIN countries c
        ON d.country_id = c.id
      ORDER BY d.nombre ASC
    `).all();
  },

  // Consultar un departamento por ID
  findById(id) {
    return db.prepare(`
      SELECT
        d.id,
        d.nombre,
        d.country_id,
        c.nombre AS pais
      FROM departments d
      INNER JOIN countries c
        ON d.country_id = c.id
      WHERE d.id = ?
    `).get(id);
  },

  // Consultar departamentos de un país
  findByCountry(countryId) {
    return db.prepare(`
      SELECT id, nombre, country_id
      FROM departments
      WHERE country_id = ?
      ORDER BY nombre ASC
    `).all(countryId);
  },

  // Crear un departamento
  create(nombre, countryId) {
    const result = db.prepare(`
      INSERT INTO departments (nombre, country_id)
      VALUES (?, ?)
    `).run(nombre, countryId);

    return this.findById(
      Number(result.lastInsertRowid)
    );
  },

  // Actualizar un departamento
  update(id, nombre, countryId) {
    const result = db.prepare(`
      UPDATE departments
      SET nombre = ?, country_id = ?
      WHERE id = ?
    `).run(nombre, countryId, id);

    return result.changes > 0
      ? this.findById(id)
      : null;
  },

  // Eliminar un departamento
  delete(id) {
    const result = db.prepare(`
      DELETE FROM departments
      WHERE id = ?
    `).run(id);

    return result.changes > 0;
  }

};
