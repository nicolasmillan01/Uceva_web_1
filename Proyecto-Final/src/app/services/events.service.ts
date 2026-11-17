
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Event } from '../interfaces/event.interface';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private readonly http = inject(HttpClient);

  private readonly url = 'http://localhost:3000/api/events';

  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('eventapp_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.url);
  }

  getMine(): Observable<Event[]> {
    return this.http.get<Event[]>(
      `${this.url}/mine`,
      { headers: this.getHeaders() }
    );
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.url}/${id}`);
  }

  create(event: Omit<Event, 'codigo'>): Observable<Event> {
    return this.http.post<Event>(
      this.url,
      event,
      { headers: this.getHeaders() }
    );
  }

  update(
    id: number,
    event: Omit<Event, 'codigo'>
  ): Observable<Event> {
    return this.http.put<Event>(
      `${this.url}/${id}`,
      event,
      { headers: this.getHeaders() }
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
