
import { db } from '../config/database.js';

export const CityModel = {

  // Consultar todas las ciudades
  findAll() {
    return db.prepare(`
      SELECT
        ci.id,
        ci.nombre,
        ci.department_id,
        d.nombre AS departamento,
        c.nombre AS pais
      FROM cities ci
      INNER JOIN departments d
        ON ci.department_id = d.id
      INNER JOIN countries c
        ON d.country_id = c.id
      ORDER BY ci.nombre ASC
    `).all();
  },

  // Consultar una ciudad por ID
  findById(id) {
    return db.prepare(`
      SELECT
        ci.id,
        ci.nombre,
        ci.department_id,
        d.nombre AS departamento,
        c.nombre AS pais
      FROM cities ci
      INNER JOIN departments d
        ON ci.department_id = d.id
      INNER JOIN countries c
        ON d.country_id = c.id
      WHERE ci.id = ?
    `).get(id);
  },

  // Consultar ciudades de un departamento
  findByDepartment(departmentId) {
    return db.prepare(`
      SELECT id, nombre, department_id
      FROM cities
      WHERE department_id = ?
      ORDER BY nombre ASC
    `).all(departmentId);
  },

  // Crear una ciudad
  create(nombre, departmentId) {
    const result = db.prepare(`
      INSERT INTO cities (nombre, department_id)
      VALUES (?, ?)
    `).run(nombre, departmentId);

    return this.findById(
      Number(result.lastInsertRowid)
    );
  },

  // Actualizar una ciudad
  update(id, nombre, departmentId) {
    const result = db.prepare(`
      UPDATE cities
      SET nombre = ?, department_id = ?
      WHERE id = ?
    `).run(nombre, departmentId, id);

    return result.changes > 0
      ? this.findById(id)
      : null;
  },

  // Eliminar una ciudad
  delete(id) {
    const result = db.prepare(`
      DELETE FROM cities
      WHERE id = ?
    `).run(id);

    return result.changes > 0;
  }
};
