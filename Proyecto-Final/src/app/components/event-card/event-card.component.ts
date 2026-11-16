import { Component, Input } from '@angular/core';
import { Event } from '../../interfaces/event.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-event-card',
  imports: [RouterLink],
  templateUrl: './event-card.component.html',
  styleUrl: './event-card.component.scss',
})
export class EventCardComponent {
  @Input() event: Event | null = null; 
}
