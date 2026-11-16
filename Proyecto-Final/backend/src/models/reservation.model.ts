
import type { DatabaseSync } from 'node:sqlite';

import type {
  Reservation,
  ReservationState
} from '../interfaces/reservation.interface.js';

export interface ReservationInput {
  usuario_id: number;
  evento_codigo: number;
  cantidad: number;
  total: number;
  estado: ReservationState;
}

export class ReservationModel {
  constructor(private readonly db: DatabaseSync) {}

  // Consultar todas las reservas con nombre del cliente y evento.
findAll(): Reservation[] {
  return this.db.prepare(`
    SELECT
      r.*,
      u.nombre AS cliente_nombre,
      e.nombre AS evento_nombre
    FROM reservations r
    LEFT JOIN users u
      ON r.usuario_id = u.id
    LEFT JOIN events e
      ON r.evento_codigo = e.codigo
    ORDER BY r.fecha_reserva DESC, r.codigo DESC
  `).all() as unknown as Reservation[];
}

  // Consultar una reserva por código.
  findById(codigo: number): Reservation | undefined {
    return this.db.prepare(`
      SELECT
        r.*,
        u.nombre AS cliente_nombre,
        e.nombre AS evento_nombre
      FROM reservations r
      LEFT JOIN users u
        ON r.usuario_id = u.id
      LEFT JOIN events e
        ON r.evento_codigo = e.codigo
      WHERE r.codigo = ?
    `).get(codigo) as Reservation | undefined;
  }

  // Consultar reservas de un usuario.
  findByUser(usuarioId: number): Reservation[] {
    return this.db.prepare(`
      SELECT
        r.*,
        u.nombre AS cliente_nombre,
        e.nombre AS evento_nombre
      FROM reservations r
      LEFT JOIN users u
        ON r.usuario_id = u.id
      LEFT JOIN events e
        ON r.evento_codigo = e.codigo
      WHERE r.usuario_id = ?
      ORDER BY r.fecha_reserva DESC
    `).all(usuarioId) as unknown as Reservation[];
  }

  // Consultar reservas de un evento.
  findByEvent(eventoCodigo: number): Reservation[] {
    return this.db.prepare(`
      SELECT
        r.*,
        u.nombre AS cliente_nombre,
        e.nombre AS evento_nombre
      FROM reservations r
      LEFT JOIN users u
        ON r.usuario_id = u.id
      LEFT JOIN events e
        ON r.evento_codigo = e.codigo
      WHERE r.evento_codigo = ?
      ORDER BY r.fecha_reserva DESC
    `).all(eventoCodigo) as unknown as Reservation[];
  }

  // Crear reserva.
  create(input: ReservationInput): Reservation {
    const result = this.db.prepare(`
      INSERT INTO reservations (
        usuario_id,
        evento_codigo,
        cantidad,
        total,
        estado
      )
      VALUES (?, ?, ?, ?, ?)
    `).run(
      input.usuario_id,
      input.evento_codigo,
      input.cantidad,
      input.total,
      input.estado
    );

    const codigo = Number(result.lastInsertRowid);
    const reserva = this.findById(codigo);

    if (!reserva) {
      throw new Error('No fue posible recuperar la reserva.');
    }

    return reserva;
  }

  // Actualizar reserva.
  update(
    codigo: number,
    input: Pick<ReservationInput, 'cantidad' | 'total' | 'estado'>
  ): Reservation | undefined {
    const result = this.db.prepare(`
      UPDATE reservations
      SET cantidad = ?, total = ?, estado = ?
      WHERE codigo = ?
    `).run(
      input.cantidad,
      input.total,
      input.estado,
      codigo
    );

    if (result.changes === 0) {
      return undefined;
    }

    return this.findById(codigo);
  }

  // Eliminar reserva.
  delete(codigo: number): boolean {
    const result = this.db.prepare(`
      DELETE FROM reservations
      WHERE codigo = ?
    `).run(codigo);

    return result.changes > 0;
  }
}
