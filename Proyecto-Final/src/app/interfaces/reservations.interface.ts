
import type { Event } from './event.interface';

export type ReservationState =
  | 'Pendiente'
  | 'Confirmada'
  | 'Cancelada';

export interface Reservation {
  codigo: number;
  usuario_id: number;
  evento_codigo: number;
  cantidad: number;
  total: number;
  estado: ReservationState;
  fecha_reserva: string;

  // Información opcional cuando la API
  // incluye los datos del evento.
  evento?: Event;
}

export interface CreateReservation {
  evento_codigo: number;
  cantidad: number;
}

export interface UpdateReservation {
  cantidad: number;
  estado: ReservationState;
}
