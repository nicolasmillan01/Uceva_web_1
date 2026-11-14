
import type { DatabaseSync } from 'node:sqlite';

import {
  ReservationModel
} from '../models/reservation.model.js';

import type {
  Reservation,
  ReservationState
} from '../interfaces/reservation.interface.js';

export class ReservationService {
  private readonly model: ReservationModel;

  constructor(private readonly db: DatabaseSync) {
    this.model = new ReservationModel(db);
  }

  private error(
    mensaje: string,
    status: number
  ): Error & { status: number } {
    return Object.assign(new Error(mensaje), { status });
  }

  private validarId(id: number): void {
    if (!Number.isSafeInteger(id) || id < 1) {
      throw this.error('Identificador inválido', 400);
    }
  }

  private validarCantidad(cantidad: number): void {
    if (!Number.isSafeInteger(cantidad) || cantidad < 1) {
      throw this.error(
        'La cantidad debe ser un entero positivo',
        400
      );
    }
  }

  private obtenerEvento(codigo: number): {
    capacidad: number;
    precio: number;
    estado: string;
  } {
    this.validarId(codigo);

    const evento = this.db.prepare(`
      SELECT capacidad, precio, estado
      FROM events
      WHERE codigo = ?
    `).get(codigo) as {
      capacidad: number;
      precio: number;
      estado: string;
    } | undefined;

    if (!evento) {
      throw this.error('Evento no encontrado', 404);
    }

    return evento;
  }

  private cuposReservados(
    eventoCodigo: number,
    excluirReserva?: number
  ): number {
    const resultado = this.db.prepare(`
      SELECT COALESCE(SUM(cantidad), 0) AS total
      FROM reservations
      WHERE evento_codigo = ?
        AND estado = 'Confirmada'
        AND codigo != ?
    `).get(
      eventoCodigo,
      excluirReserva ?? -1
    ) as { total: number };

    return resultado.total;
  }

  private comprobarDisponibilidad(
    eventoCodigo: number,
    cantidad: number,
    excluirReserva?: number
  ): number {
    this.validarCantidad(cantidad);

    const evento = this.obtenerEvento(eventoCodigo);

    if (
      evento.estado === 'Cancelado' ||
      evento.estado === 'Finalizado'
    ) {
      throw this.error(
        'No se permiten reservas para este evento',
        400
      );
    }

    const ocupados = this.cuposReservados(
      eventoCodigo,
      excluirReserva
    );

    if (ocupados + cantidad > evento.capacidad) {
      throw this.error(
        'No hay suficientes cupos disponibles',
        409
      );
    }

    return evento.precio * cantidad;
  }

  private transaccion<T>(operacion: () => T): T {
    this.db.exec('BEGIN IMMEDIATE');

    try {
      const resultado = operacion();
      this.db.exec('COMMIT');
      return resultado;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  getAll(): Reservation[] {
    return this.model.findAll();
  }

  getById(codigo: number): Reservation {
    this.validarId(codigo);

    const reserva = this.model.findById(codigo);

    if (!reserva) {
      throw this.error('Reserva no encontrada', 404);
    }

    return reserva;
  }

  getByUser(usuarioId: number): Reservation[] {
    this.validarId(usuarioId);
    return this.model.findByUser(usuarioId);
  }

  getByEvent(eventoCodigo: number): Reservation[] {
    this.validarId(eventoCodigo);
    return this.model.findByEvent(eventoCodigo);
  }

  create(
    usuarioId: number,
    eventoCodigo: number,
    cantidad: number
  ): Reservation {
    this.validarId(usuarioId);
    this.validarId(eventoCodigo);
    this.validarCantidad(cantidad);

    return this.transaccion(() => {
      const usuario = this.db.prepare(`
        SELECT id, rol
        FROM users
        WHERE id = ?
      `).get(usuarioId) as {
        id: number;
        rol: string;
      } | undefined;

      if (!usuario || usuario.rol !== 'cliente') {
        throw this.error('Cliente no válido', 403);
      }

      const total = this.comprobarDisponibilidad(
        eventoCodigo,
        cantidad
      );

      return this.model.create({
        usuario_id: usuarioId,
        evento_codigo: eventoCodigo,
        cantidad,
        total,
        estado: 'Confirmada'
      });
    });
  }

  update(
    codigo: number,
    cantidad: number,
    estado: ReservationState
  ): Reservation {
    this.validarId(codigo);
    this.validarCantidad(cantidad);

    if (
      !['Pendiente', 'Confirmada', 'Cancelada'].includes(estado)
    ) {
      throw this.error('Estado de reserva inválido', 400);
    }

    return this.transaccion(() => {
      const reserva = this.getById(codigo);

      let total = reserva.total;

      if (estado === 'Confirmada') {
        total = this.comprobarDisponibilidad(
          reserva.evento_codigo,
          cantidad,
          codigo
        );
      } else {
        const evento = this.obtenerEvento(
          reserva.evento_codigo
        );

        total = evento.precio * cantidad;
      }

      const actualizada = this.model.update(codigo, {
        cantidad,
        total,
        estado
      });

      if (!actualizada) {
        throw this.error('Reserva no encontrada', 404);
      }

      return actualizada;
    });
  }

  delete(codigo: number): boolean {
    this.validarId(codigo);

    return this.transaccion(() => {
      const eliminada = this.model.delete(codigo);

      if (!eliminada) {
        throw this.error('Reserva no encontrada', 404);
      }

      return eliminada;
    });
  }
}
