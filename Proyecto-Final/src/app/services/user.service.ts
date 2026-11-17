
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

// Estructura de un usuario
export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'cliente' | 'agente' | 'administrador';
  city_id: number;
  created_at: string;
}

// Datos necesarios para crear usuarios
export interface CreateUserData {
  nombre: string;
  email: string;
  password: string;
  rol: 'cliente' | 'agente' | 'administrador';
  city_id: number;
}

// Datos que se pueden modificar
export interface UpdateUserData {
  nombre?: string;
  city_id?: number;
  rol?: 'cliente' | 'agente' | 'administrador';
}

// Respuesta al crear o actualizar
export interface UserResponse {
  message: string;
  usuario: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/users';

  // Obtener el token de la sesión actual
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem(
      'eventapp_token'
    );

    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });
  }

  // GET: consultar todos los usuarios
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(
      this.apiUrl,
      {
        headers: this.getHeaders()
      }
    );
  }

  // GET: consultar usuario por ID
  getById(id: number): Observable<User> {
    return this.http.get<User>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // POST: crear un usuario
  create(data: CreateUserData): Observable<UserResponse> {
    return this.http.post<UserResponse>(
      this.apiUrl,
      data,
      {
        headers: this.getHeaders()
      }
    );
  }

  // PUT: actualizar un usuario
  update(
    id: number,
    data: UpdateUserData
  ): Observable<UserResponse> {
    return this.http.put<UserResponse>(
      `${this.apiUrl}/${id}`,
      data,
      {
        headers: this.getHeaders()
      }
    );
  }

  // DELETE: eliminar un usuario
  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}
