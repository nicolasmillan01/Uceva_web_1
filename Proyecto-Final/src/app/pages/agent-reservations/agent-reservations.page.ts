
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Event } from '../../interfaces/event.interface';
import { Reservation } from '../../interfaces/reservations.interface';

import { EventsService } from '../../services/events.service';
import { ReservationsService } from '../../services/reservations.service';

@Component({
  selector: 'app-agent-reservations.page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './agent-reservations.page.html',
  styleUrl: './agent-reservations.page.scss'
})
export class AgentReservationsPage implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly eventsService = inject(EventsService);
  private readonly reservationsService = inject(ReservationsService);

  evento: Event | null = null;
  reservas: Reservation[] = [];

  cargando = false;
  error = '';
  mensajeExito = '';

  procesandoCodigo: number | null = null;

  ngOnInit(): void {
    const parametro =
      this.route.snapshot.paramMap.get('id') ??
      this.route.snapshot.queryParamMap.get('eventId');

    if (parametro === null || !/^[1-9]\d*$/.test(parametro)) {
      this.error = 'No se ha seleccionado un evento válido.';
      return;
    }

    const codigo = Number(parametro);

    if (!Number.isSafeInteger(codigo)) {
      this.error = 'Identificador del evento inválido.';
      return;
    }

    this.cargarEvento(codigo);
  }

  // Consultar información del evento.
  cargarEvento(codigo: number): void {
    this.cargando = true;
    this.error = '';

    this.eventsService.getById(codigo)
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (evento: Event) => {
          this.evento = evento;
          this.cargarReservas();
        },

        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            this.error = 'El evento no fue encontrado.';
          } else if (err.status === 0) {
            this.error = 'No se pudo conectar con el servidor.';
          } else {
            this.error =
              err.error?.error ||
              'No fue posible consultar el evento.';
          }
        }
      });
  }

  // Consultar reservas del agente.
  cargarReservas(): void {
    this.reservationsService.getByAgent()
      .subscribe({
        next: (reservas: Reservation[]) => {
          this.reservas = reservas.filter(
            reserva =>
              reserva.evento_codigo === this.evento?.codigo
          );
        },

        error: (err: HttpErrorResponse) => {
          this.error =
            err.error?.error ||
            'No fue posible consultar las reservas del evento.';
        }
      });
  }

  // Confirmar o cancelar una reserva.
  actualizarEstado(
    reserva: Reservation,
    estado: 'Confirmada' | 'Cancelada'
  ): void {

    if (
      this.procesandoCodigo !== null ||
      reserva.estado !== 'Pendiente'
    ) {
      return;
    }

    this.error = '';
    this.mensajeExito = '';
    this.procesandoCodigo = reserva.codigo;

    this.reservationsService.update(
      reserva.codigo,
      {
        cantidad: reserva.cantidad,
        estado
      }
    )
    .pipe(
      finalize(() => {
        this.procesandoCodigo = null;
      })
    )
    .subscribe({
      next: (actualizada: Reservation) => {

        this.reservas = this.reservas.map(item =>
          item.codigo === actualizada.codigo
            ? actualizada
            : item
        );

        this.mensajeExito =
          estado === 'Confirmada'
            ? 'La reserva fue confirmada correctamente.'
            : 'La reserva fue cancelada correctamente.';
      },

      error: (err: HttpErrorResponse) => {
        this.error =
          err.error?.error ||
          'No fue posible actualizar la reserva.';
      }
    });
  }

  // Indicadores de reservas.
  get totalReservas(): number {
    return this.reservas.length;
  }

  get entradasReservadas(): number {
    return this.reservas
      .filter(reserva =>
        reserva.estado === 'Pendiente' ||
        reserva.estado === 'Confirmada'
      )
      .reduce(
        (total, reserva) => total + reserva.cantidad,
        0
      );
  }

  get valorReservas(): number {
    return this.reservas
      .filter(reserva =>
        reserva.estado === 'Pendiente' ||
        reserva.estado === 'Confirmada'
      )
      .reduce(
        (total, reserva) => total + reserva.total,
        0
      );
  }

  // Estilos de los estados del evento.
  claseEstadoEvento(estado: string): string {
    switch (estado) {
      case 'Programado':
      case 'En Boleteria':
        return 'status-badge--programado';

      case 'En Vivo':
        return 'status-badge--confirmed';

      case 'Cancelado':
        return 'status-badge--cancelled';

      case 'Finalizado':
        return 'status-badge--reserved';

      default:
        return '';
    }
  }

  // Estilos de los estados de las reservas.
  claseEstadoReserva(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'status-badge--programado';

      case 'Confirmada':
        return 'status-badge--confirmed';

      case 'Cancelada':
        return 'status-badge--cancelled';

      default:
        return '';
    }
  }
}
