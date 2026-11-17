
import { db } from '../config/database.js';

export const UserModel = {

  // Consultar todos los usuarios sin mostrar contraseñas
  findAll() {
    return db.prepare(`
      SELECT
        id,
        nombre,
        email,
        rol,
        city_id,
        created_at
      FROM users
      ORDER BY id DESC
    `).all();
  },

  // Buscar un usuario por su ID
  findById(id) {
    return db.prepare(`
      SELECT
        id,
        nombre,
        email,
        rol,
        city_id,
        created_at
      FROM users
      WHERE id = ?
    `).get(id);
  },

  // Buscar por correo electrónico
  // Incluye el hash para verificar el login
  findByEmail(email) {
    return db.prepare(`
      SELECT
        id,
        nombre,
        email,
        password_hash,
        rol,
        city_id,
        created_at
      FROM users
      WHERE email = ?
    `).get(email);
  },

  // Registrar un usuario
  create({
    nombre,
    email,
    password_hash,
    rol,
    city_id
  }) {
    const result = db.prepare(`
      INSERT INTO users (
        nombre,
        email,
        password_hash,
        rol,
        city_id
      )
      VALUES (?, ?, ?, ?, ?)
    `).run(
      nombre,
      email,
      password_hash,
      rol,
      city_id
    );

    return this.findById(
      Number(result.lastInsertRowid)
    );
  },

  // Actualizar datos básicos de un usuario
  update(id, { nombre, city_id }) {
    const result = db.prepare(`
      UPDATE users
      SET nombre = ?, city_id = ?
      WHERE id = ?
    `).run(nombre, city_id, id);

    return result.changes > 0
      ? this.findById(id)
      : null;
  },


  // Actualizar el rol de un usuario
  updateRole(id, rol) {
    const result = db.prepare(`
      UPDATE users
      SET rol = ?
      WHERE id = ?
    `).run(rol, id);

    return result.changes > 0
      ? this.findById(id)
      : null;
  },


  // Eliminar un usuario
  delete(id) {
    const result = db.prepare(`
      DELETE FROM users
      WHERE id = ?
    `).run(id);

    return result.changes > 0;
  }
};
