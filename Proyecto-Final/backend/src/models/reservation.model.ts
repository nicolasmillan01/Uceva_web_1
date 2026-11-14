
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

  findAll(): Reservation[] {
    return this.db.prepare(`
      SELECT *
      FROM reservations
      ORDER BY fecha_reserva DESC, codigo DESC
    `).all() as unknown as Reservation[];
  }

  findById(codigo: number): Reservation | undefined {
    return this.db.prepare(`
      SELECT *
      FROM reservations
      WHERE codigo = ?
    `).get(codigo) as Reservation | undefined;
  }

  findByUser(usuarioId: number): Reservation[] {
    return this.db.prepare(`
      SELECT *
      FROM reservations
      WHERE usuario_id = ?
      ORDER BY fecha_reserva DESC
    `).all(usuarioId) as unknown as Reservation[];
  }

  findByEvent(eventoCodigo: number): Reservation[] {
    return this.db.prepare(`
      SELECT *
      FROM reservations
      WHERE evento_codigo = ?
      ORDER BY fecha_reserva DESC
    `).all(eventoCodigo) as unknown as Reservation[];
  }

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

  delete(codigo: number): boolean {
    const result = this.db.prepare(`
      DELETE FROM reservations
      WHERE codigo = ?
    `).run(codigo);

    return result.changes > 0;
  }
}
