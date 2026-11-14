
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Reservation,
  CreateReservation,
  UpdateReservation
} from '../interfaces/reservations.interface';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/reservations';

  getAll(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  getMine(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(
      `${this.apiUrl}/mine`
    );
  }

  getById(codigo: number): Observable<Reservation> {
    return this.http.get<Reservation>(
      `${this.apiUrl}/${codigo}`
    );
  }

  create(datos: CreateReservation): Observable<Reservation> {
    return this.http.post<Reservation>(
      this.apiUrl,
      datos
    );
  }

  update(
    codigo: number,
    datos: UpdateReservation
  ): Observable<Reservation> {
    return this.http.put<Reservation>(
      `${this.apiUrl}/${codigo}`,
      datos
    );
  }

  delete(codigo: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${codigo}`
    );
  }
}
