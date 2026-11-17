
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { EventsService } from '../../services/events.service';
import { Event } from '../../interfaces/event.interface';

@Component({
  selector: 'app-agent-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './agent-reports.page.html',
  styleUrl: './agent-reports.page.scss'
})
export class AgentReportsPage implements OnInit {

  private readonly eventsService = inject(EventsService);

  eventos: Event[] = [];

  cargando = false;
  error = '';

  ngOnInit(): void {
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.cargando = true;
    this.error = '';

    this.eventsService.getMine()
      .pipe(finalize(() => this.cargando = false))
      .subscribe({
        next: (eventos: Event[]) => {
          this.eventos = eventos;
        },
        error: (err: HttpErrorResponse) => {
          this.eventos = [];
          this.error = err.status === 0
            ? 'No se pudo conectar con el servidor.'
            : 'No fue posible consultar los eventos.';
        }
      });
  }

  get totalEventos(): number {
    return this.eventos.length;
  }

  get capacidadTotal(): number {
    return this.eventos.reduce(
      (total, evento) => total + evento.capacidad,
      0
    );
  }

  contarPorEstado(estado: Event['estado']): number {
    return this.eventos.filter(
      evento => evento.estado === estado
    ).length;
  }

  get ciudades(): { nombre: string; cantidad: number }[] {
    const conteo = new Map<string, number>();

    for (const evento of this.eventos) {
      const ciudad = evento.ciudad;
      conteo.set(ciudad, (conteo.get(ciudad) ?? 0) + 1);
    }

    return Array.from(conteo, ([nombre, cantidad]) => ({
      nombre,
      cantidad
    })).sort((a, b) => b.cantidad - a.cantidad);
  }
}
