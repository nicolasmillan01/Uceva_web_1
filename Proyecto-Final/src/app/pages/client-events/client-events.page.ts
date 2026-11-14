import { Component, OnInit, inject } from '@angular/core';
import { EventCardComponent } from '../../components/event-card/event-card.component';
import { Event } from '../../interfaces/event.interface';
import { EventsService } from '../../services/events.service';
@Component({
  selector: 'app-client-events.page',
  imports: [EventCardComponent],
  templateUrl: './client-events.page.html',
  styleUrl: './client-events.page.scss',
})
export class ClientEventsPage implements OnInit {
  private readonly eventsService = inject(EventsService);
  events: Event[] = [];
  loading = true;
  error = '';
  ngOnInit(): void {
    this.eventsService.getAll().subscribe({
      next: data => { this.events = data; this.loading = false; },
      error: () => { this.error = 'No se pudieron cargar los eventos. Comprueba que el backend esté ejecutándose.'; this.loading = false; }
    });
  }
}
