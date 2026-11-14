import { db } from '../config/database.js';
const fields = 'codigo, nombre, descripcion, teatro, ciudad, fecha_inicio, fecha_fin, capacidad, precio, observaciones, estado';
export const EventModel = {
  findAll: () => db.prepare(`SELECT ${fields} FROM events ORDER BY fecha_inicio DESC`).all(),
  findById: (id) => db.prepare(`SELECT ${fields} FROM events WHERE codigo = ?`).get(id),
  create: (e) => {
    const result = db.prepare(`INSERT INTO events (nombre, descripcion, teatro, ciudad, fecha_inicio, fecha_fin, capacidad, precio, observaciones, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(e.nombre,e.descripcion,e.teatro,e.ciudad,e.fecha_inicio,e.fecha_fin,e.capacidad,e.precio,e.observaciones,e.estado);
    return EventModel.findById(Number(result.lastInsertRowid));
  },
  update: (id,e) => {
    const result = db.prepare(`UPDATE events SET nombre=?, descripcion=?, teatro=?, ciudad=?, fecha_inicio=?, fecha_fin=?, capacidad=?, precio=?, observaciones=?, estado=? WHERE codigo=?`).run(e.nombre,e.descripcion,e.teatro,e.ciudad,e.fecha_inicio,e.fecha_fin,e.capacidad,e.precio,e.observaciones,e.estado,id);
    return result.changes ? EventModel.findById(id) : null;
  },
  delete: (id) => db.prepare('DELETE FROM events WHERE codigo=?').run(id).changes > 0
};
