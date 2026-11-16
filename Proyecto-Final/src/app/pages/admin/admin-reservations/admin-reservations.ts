
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { ReservationsService } from '../../../services/reservations.service';

import {
  Reservation,
  ReservationState
} from '../../../interfaces/reservations.interface';

type ReservationFilter = 'Todas' | ReservationState;

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent
  ],
  templateUrl: './admin-reservations.html',
  styleUrl: './admin-reservations.scss'
})
export class AdminReservations implements OnInit {

  private readonly reservationsService = inject(ReservationsService);

  reservas: Reservation[] = [];

  cargando = false;
  error = '';
  mensaje = '';

  actualizandoCodigo: number | null = null;

  filtro: ReservationFilter = 'Todas';

  ngOnInit(): void {
    this.cargarReservas();
  }

  get reservasFiltradas(): Reservation[] {
    if (this.filtro === 'Todas') {
      return this.reservas;
    }

    return this.reservas.filter(
      reserva => reserva.estado === this.filtro
    );
  }

  get totalPendientes(): number {
    return this.reservas.filter(
      reserva => reserva.estado === 'Pendiente'
    ).length;
  }

  get totalConfirmadas(): number {
    return this.reservas.filter(
      reserva => reserva.estado === 'Confirmada'
    ).length;
  }

  get totalCanceladas(): number {
    return this.reservas.filter(
      reserva => reserva.estado === 'Cancelada'
    ).length;
  }

  cargarReservas(): void {
    this.cargando = true;
    this.error = '';

    this.reservationsService.getAll()
      .pipe(
        finalize(() => this.cargando = false)
      )
      .subscribe({
        next: (reservas) => {
          this.reservas = reservas;
        },
        error: (err: HttpErrorResponse) => {
          this.error =
            err.error?.error ||
            'No fue posible cargar las reservas.';
        }
      });
  }

  cambiarEstado(
    reserva: Reservation,
    nuevoEstado: ReservationState
  ): void {

    if (this.actualizandoCodigo !== null) {
      return;
    }

    if (reserva.estado !== 'Pendiente') {
      return;
    }

    const mensaje = nuevoEstado === 'Confirmada'
      ? '¿Deseas aprobar esta reserva?'
      : '¿Deseas rechazar esta solicitud?';

    if (!window.confirm(mensaje)) {
      return;
    }

    this.error = '';
    this.mensaje = '';
    this.actualizandoCodigo = reserva.codigo;

    this.reservationsService.update(
      reserva.codigo,
      {
        cantidad: reserva.cantidad,
        estado: nuevoEstado
      }
    )
    .pipe(
      finalize(() => this.actualizandoCodigo = null)
    )
    .subscribe({
      next: (actualizada) => {

        this.reservas = this.reservas.map(item =>
          item.codigo === actualizada.codigo
            ? actualizada
            : item
        );

        this.mensaje = nuevoEstado === 'Confirmada'
          ? 'La reserva fue aprobada correctamente.'
          : 'La solicitud fue rechazada correctamente.';
      },

      error: (err: HttpErrorResponse) => {
        this.error =
          err.error?.error ||
          'No fue posible actualizar la reserva.';
      }
    });
  }

  seleccionarFiltro(filtro: ReservationFilter): void {
    this.filtro = filtro;
  }

  claseEstado(estado: ReservationState): string {
    switch (estado) {
      case 'Pendiente':
        return 'status-pending';

      case 'Confirmada':
        return 'status-confirmed';

      case 'Cancelada':
        return 'status-cancelled';

      default:
        return '';
    }
  }
}
