
import { db } from '../config/database.js';

const fields = `
  codigo, nombre, descripcion, teatro, ciudad,
  fecha_inicio, fecha_fin, capacidad, precio,
  observaciones, estado, creado_por
`;

export const EventModel = {

  findAll: () => db.prepare(`
    SELECT ${fields}
    FROM events
    ORDER BY fecha_inicio DESC
  `).all(),

  findById: (id) => db.prepare(`
    SELECT ${fields}
    FROM events
    WHERE codigo = ?
  `).get(id),

  findByOwner: (userId) => db.prepare(`
    SELECT ${fields}
    FROM events
    WHERE creado_por = ?
    ORDER BY fecha_inicio DESC
  `).all(userId),

  create: (e, userId) => {
    const result = db.prepare(`
      INSERT INTO events (
        nombre, descripcion, teatro, ciudad,
        fecha_inicio, fecha_fin, capacidad,
        precio, observaciones, estado, creado_por
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      e.nombre,
      e.descripcion,
      e.teatro,
      e.ciudad,
      e.fecha_inicio,
      e.fecha_fin,
      e.capacidad,
      e.precio,
      e.observaciones,
      e.estado,
      userId
    );

    return EventModel.findById(
      Number(result.lastInsertRowid)
    );
  },

  update: (id, e, userId = null) => {
    const sql = userId === null
      ? `UPDATE events SET
          nombre=?, descripcion=?, teatro=?, ciudad=?,
          fecha_inicio=?, fecha_fin=?, capacidad=?,
          precio=?, observaciones=?, estado=?
         WHERE codigo=?`
      : `UPDATE events SET
          nombre=?, descripcion=?, teatro=?, ciudad=?,
          fecha_inicio=?, fecha_fin=?, capacidad=?,
          precio=?, observaciones=?, estado=?
         WHERE codigo=? AND creado_por=?`;

    const values = [
      e.nombre, e.descripcion, e.teatro, e.ciudad,
      e.fecha_inicio, e.fecha_fin, e.capacidad,
      e.precio, e.observaciones, e.estado, id
    ];

    if (userId !== null) values.push(userId);

    const result = db.prepare(sql).run(...values);

    return result.changes
      ? EventModel.findById(id)
      : null;
  },

  delete: (id, userId = null) => {
    const result = userId === null
      ? db.prepare(
          'DELETE FROM events WHERE codigo=?'
        ).run(id)
      : db.prepare(
          'DELETE FROM events WHERE codigo=? AND creado_por=?'
        ).run(id, userId);

    return result.changes > 0;
  }
};
