
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
}

export interface CreateReservationDTO {
  evento_codigo: number;
  cantidad: number;
}

export interface UpdateReservationDTO {
  cantidad?: number;
  estado?: ReservationState;
}

export interface Reservation {
  codigo: number;
  usuario_id: number;
  evento_codigo: number;
  cantidad: number;
  total: number;
  estado: ReservationState;
  fecha_reserva: string;

  cliente_nombre?: string;
  evento_nombre?: string;
}