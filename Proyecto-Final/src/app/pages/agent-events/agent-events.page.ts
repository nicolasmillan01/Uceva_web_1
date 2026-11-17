
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsService } from '../../services/events.service';
import { Event } from '../../interfaces/event.interface';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-agent-events.page',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './agent-events.page.html',
  styleUrl: './agent-events.page.scss',
})
export class AgentEventsPage implements OnInit {

  private readonly eventsService = inject(EventsService);

  eventos: Event[] = [];
  cargando = false;
  error = '';

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos(): void {
    this.cargando = true;
    this.error = '';

    this.eventsService.getMine().subscribe({
      next: (datos: Event[]) => {
        this.eventos = datos;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No fue posible cargar los eventos.';
        this.cargando = false;
      }
    });
  }

  eliminarEvento(codigo: number): void {
    const confirmado = window.confirm(
      '¿Estás seguro de que deseas eliminar este evento?'
    );

    if (!confirmado) {
      return;
    }

    this.eventsService.delete(codigo).subscribe({
      next: () => {
        this.cargarEventos();
      },
      error: () => {
        this.error = 'No fue posible eliminar el evento.';
      }
    });
  }
}
