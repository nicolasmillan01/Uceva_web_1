
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Event } from '../../interfaces/event.interface';
import { EventsService } from '../../services/events.service';

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

  evento: Event | null = null;

  cargando = false;
  error = '';

  // El backend todavía no dispone de una consulta
  // de reservas filtradas y autorizadas por agente.
  reservasDisponibles = false;

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

  claseEstadoEvento(estado: string): string {
    switch (estado) {
      case 'Programado':
        return 'status-badge--programado';

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
}
