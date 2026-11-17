
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Event } from '../interfaces/event.interface';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private readonly http = inject(HttpClient);

  private readonly url =
    'http://localhost:3000/api/events';

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.url);
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(
      `${this.url}/${id}`
    );
  }

  create(event: Omit<Event, 'codigo'>): Observable<Event> {
    return this.http.post<Event>(
      this.url,
      event
    );
  }

  update(
    id: number,
    event: Omit<Event, 'codigo'>
  ): Observable<Event> {
    return this.http.put<Event>(
      `${this.url}/${id}`,
      event
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/${id}`
    );
  }
}
