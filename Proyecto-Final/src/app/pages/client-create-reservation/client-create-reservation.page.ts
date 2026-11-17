
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { finalize } from 'rxjs';

import { Event } from '../../interfaces/event.interface';
import { EventsService } from '../../services/events.service';
import { ReservationsService } from '../../services/reservations.service';

@Component({
  selector: 'app-client-create-reservation.page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './client-create-reservation.page.html',
  styleUrl: './client-create-reservation.page.scss'
})
export class ClientCreateReservationPage implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private readonly eventsService = inject(EventsService);
  private readonly reservationsService = inject(ReservationsService);

  evento: Event | null = null;

  cargando = false;
  guardando = false;

  error = '';
  exito = '';

  formulario = this.fb.nonNullable.group({
    cantidad: [
      1,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(10)
      ]
    ]
  });

  get cantidad(): number {
    return this.formulario.controls.cantidad.value;
  }

  get total(): number {
    if (!this.evento) {
      return 0;
    }

    return this.evento.precio * this.cantidad;
  }

  ngOnInit(): void {
    const parametro = this.route.snapshot.paramMap.get('id');

    if (parametro === null || !/^[1-9]\d*$/.test(parametro)) {
      this.error = 'Identificador del evento inválido.';
      return;
    }

    const codigo = Number(parametro);

    if (!Number.isSafeInteger(codigo)) {
      this.error = 'Identificador del evento inválido.';
      return;
    }

    this.cargarEvento(codigo);
  }

  cargarEvento(codigo: number): void {
    this.cargando = true;
    this.error = '';
    this.evento = null;

    this.eventsService.getById(codigo)
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (evento: Event) => {
          this.evento = evento;
        },

        error: (err: HttpErrorResponse) => {
          this.error =
            err.error?.error ||
            'No fue posible cargar el evento.';
        }
      });
  }

  realizarReserva(): void {
    this.error = '';
    this.exito = '';

    if (this.guardando || this.cargando || !this.evento) {
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error = 'Selecciona una cantidad válida de entradas.';
      return;
    }

    if (
      this.evento.estado === 'Cancelado' ||
      this.evento.estado === 'Finalizado'
    ) {
      this.error = 'Este evento no permite nuevas reservas.';
      return;
    }

    this.guardando = true;

    this.reservationsService.create({
      evento_codigo: this.evento.codigo,
      cantidad: this.cantidad
    })
      .pipe(
        finalize(() => {
          this.guardando = false;
        })
      )
      .subscribe({
        next: () => {
          this.exito = 'Reserva realizada correctamente.';
          void this.router.navigate(['/client/reservations']);
        },

        error: (err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.error = 'Debes iniciar sesión para reservar.';
          } else if (err.status === 403) {
            this.error = 'No tienes permiso para realizar esta reserva.';
          } else if (err.status === 404) {
            this.error = 'El servicio de reservas no está disponible o el recurso no existe.';
          } else if (err.status === 409) {
            this.error = 'No hay suficientes entradas disponibles.';
          } else if (err.status === 0) {
            this.error = 'No se pudo establecer conexión con el servidor.';
          } else {
            this.error =
              err.error?.error ||
              'No fue posible registrar la reserva.';
          }
        }
      });
  }
}
