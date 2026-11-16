
import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ReservationsService } from '../../services/reservations.service';

import {
  Reservation,
  ReservationState
} from '../../interfaces/reservations.interface';

// Datos preparados para la tabla
interface ReservaVista extends Reservation {
  nombreEvento: string;
}

@Component({
  selector: 'app-client-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './client-reservations.page.html',
  styleUrl: './client-reservations.page.scss'
})
export class ClientReservationsPage implements OnInit {

  private reservationsService =
    inject(ReservationsService);

  // Reservas del cliente
  reservas: ReservaVista[] = [];

  // Estado de carga
  cargando = false;

  // Mensajes de error
  error = '';

  // Total de reservas
  get totalReservas(): number {
    return this.reservas.length;
  }

  // Cargar reservas al entrar a la pantalla
  ngOnInit(): void {
    this.cargarReservas();
  }

  // Consultar reservas desde el backend
  cargarReservas(): void {

    this.cargando = true;
    this.error = '';

    this.reservationsService.getMine().subscribe({

      next: (reservas: Reservation[]) => {

        this.reservas = reservas.map((reserva) => {

          // El nombre del evento puede venir
          // incluido en la respuesta del backend.
          const evento = reserva.evento as
            | { nombre?: string; titulo?: string }
            | undefined;

          return {
            ...reserva,

            nombreEvento:
              evento?.nombre ||
              evento?.titulo ||
              `Evento #${reserva.evento_codigo}`
          };
        });

        this.cargando = false;
      },

      error: (error) => {

        this.cargando = false;

        if (error.status === 401) {
          this.error =
            'Tu sesión no está autorizada. Inicia sesión nuevamente.';
        } else if (error.status === 403) {
          this.error =
            'No tienes permisos para consultar estas reservas.';
        } else {
          this.error =
            'No se pudieron cargar tus reservas.';
        }

      }

    });
  }

  // Estilos según el estado de la reserva
  claseEstado(estado: ReservationState): string {

    switch (estado) {

      case 'Confirmada':
        return 'bg-success text-white';

      case 'Pendiente':
        return 'bg-warning text-dark';

      case 'Cancelada':
        return 'bg-danger text-white';

      default:
        return 'bg-secondary text-white';
    }
  }
}
