
import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

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

  // OBTENER TOKEN JWT
  private getHeaders(): HttpHeaders {

    const token =
      sessionStorage.getItem('eventapp_token');

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // CONSULTAR TODAS LAS RESERVAS
  getAll(): Observable<Reservation[]> {

    return this.http.get<Reservation[]>(
      this.apiUrl,
      {
        headers: this.getHeaders()
      }
    );
  }

  // CONSULTAR RESERVAS DEL CLIENTE
  getMine(): Observable<Reservation[]> {

    return this.http.get<Reservation[]>(
      `${this.apiUrl}/mine`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // CONSULTAR RESERVAS DE LOS EVENTOS DEL AGENTE
  getByAgent(): Observable<Reservation[]> {

    return this.http.get<Reservation[]>(
      `${this.apiUrl}/agent`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // CONSULTAR UNA RESERVA
  getById(codigo: number): Observable<Reservation> {

    return this.http.get<Reservation>(
      `${this.apiUrl}/${codigo}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // CREAR RESERVA
  create(datos: CreateReservation): Observable<Reservation> {

    return this.http.post<Reservation>(
      this.apiUrl,
      datos,
      {
        headers: this.getHeaders()
      }
    );
  }

  // ACTUALIZAR RESERVA
  update(
    codigo: number,
    datos: UpdateReservation
  ): Observable<Reservation> {

    return this.http.put<Reservation>(
      `${this.apiUrl}/${codigo}`,
      datos,
      {
        headers: this.getHeaders()
      }
    );
  }

  // ELIMINAR RESERVA
  delete(codigo: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${codigo}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}
