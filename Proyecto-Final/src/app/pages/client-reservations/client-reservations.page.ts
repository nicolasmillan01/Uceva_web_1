
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import {
  Reservation,
  ReservationState
} from '../../interfaces/reservations.interface';

import { ReservationsService } from '../../services/reservations.service';
import { EventsService } from '../../services/events.service';
import { Event } from '../../interfaces/event.interface';

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

  private readonly reservationsService = inject(ReservationsService);
  private readonly eventsService = inject(EventsService);

  reservas: ReservaVista[] = [];

  cargando = false;
  error = '';

  get totalReservas(): number {
    return this.reservas.length;
  }

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.cargando = true;
    this.error = '';
    this.reservas = [];

    this.reservationsService.getMine()
      .pipe(
        catchError((err: HttpErrorResponse) => {

          if (err.status === 401) {
            this.error =
              'Tu sesión no está autorizada. Inicia sesión nuevamente.';

          } else if (err.status === 403) {
            this.error =
              'No tienes permisos para consultar estas reservas.';

          } else if (err.status === 404) {
            this.error =
              'El servicio de reservas todavía no está disponible.';

          } else if (err.status === 0) {
            this.error =
              'No se pudo conectar con el servidor.';

          } else {
            this.error =
              'No fue posible cargar tus reservas.';
          }

          return of(null);
        }),
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe((reservas: Reservation[] | null) => {

        if (reservas === null) {
          return;
        }

        if (reservas.length === 0) {
          this.reservas = [];
          return;
        }

        this.cargarNombresEventos(reservas);
      });
  }

  private cargarNombresEventos(reservas: Reservation[]): void {

    const consultas = reservas.map((reserva: Reservation) =>
      this.eventsService.getById(reserva.evento_codigo).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(consultas)
      .subscribe((eventos: (Event | null)[]) => {

        this.reservas = reservas.map((reserva, index) => ({
          ...reserva,

          nombreEvento:
            eventos[index]?.nombre ??
            `Evento #${reserva.evento_codigo}`
        }));

      });
  }

  claseEstado(estado: ReservationState): string {

    switch (estado) {

      case 'Confirmada':
        return 'reservation-status--confirmed';

      case 'Pendiente':
        return 'reservation-status--reserved';

      case 'Cancelada':
        return 'reservation-status--cancelled';

      default:
        return '';
    }
  }
}
