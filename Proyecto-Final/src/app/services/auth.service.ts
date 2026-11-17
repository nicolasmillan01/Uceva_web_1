
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  tap,
  map,
  catchError,
  throwError
} from 'rxjs';

// Información del usuario autenticado
export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: 'cliente' | 'agente' | 'administrador';
  city_id: number | null;
  created_at: string;
}

// Información necesaria para registrar usuarios
export interface RegisterData {
  nombre: string;
  email: string;
  password: string;
  city_id: number;
}

// Respuesta del registro
export interface RegisterResponse {
  mensaje: string;
  usuario: AuthUser;
}

// Respuesta del inicio de sesión
export interface LoginResponse {
  mensaje: string;
  usuario: AuthUser;
  token: string;
}

// Respuesta de la verificación de sesión
export interface SessionResponse {
  usuario: AuthUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Comunicación HTTP con el backend
  private http = inject(HttpClient);

  // Dirección de la API de autenticación
  private apiUrl = 'http://localhost:3000/api/auth';

  // Usuario actualmente autenticado
  currentUser = signal<AuthUser | null>(null);

  // REGISTRAR USUARIO
  register(
    data: RegisterData
  ): Observable<RegisterResponse> {

    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      data
    );
  }

  // INICIAR SESIÓN
  login(
    email: string,
    password: string
  ): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      {
        email,
        password
      }
    ).pipe(

      tap(response => {

        // Guardar el token JWT
        sessionStorage.setItem(
          'eventapp_token',
          response.token
        );

        // Guardar el usuario en Angular
        this.currentUser.set(response.usuario);

      })

    );
  }

  // OBTENER EL TOKEN JWT
  getToken(): string | null {

    return sessionStorage.getItem(
      'eventapp_token'
    );
  }

  // RECUPERAR LA SESIÓN
  restoreSession(): Observable<AuthUser> {

    const token = this.getToken();

    // Comprobar que existe un token
    if (!token) {

      this.currentUser.set(null);

      return throwError(() =>
        new Error('No existe una sesión activa')
      );
    }

    // Consultar al backend
    return this.http.get<SessionResponse>(
      `${this.apiUrl}/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).pipe(

      // Obtener el usuario de la respuesta
      map(response => response.usuario),

      // Actualizar el usuario autenticado
      tap(user => {
        this.currentUser.set(user);
      }),

      // Manejar errores de sesión
      catchError(error => {

        this.logout();

        return throwError(() => error);

      })

    );
  }

  // CERRAR SESIÓN
  logout(): void {

    // Eliminar el token
    sessionStorage.removeItem(
      'eventapp_token'
    );

    // Limpiar los datos del usuario
    this.currentUser.set(null);
  }

  // COMPROBAR SI EXISTE UN TOKEN
  isAuthenticated(): boolean {

    return !!this.getToken();
  }

  // OBTENER EL USUARIO ACTUAL
  getCurrentUser(): AuthUser | null {

    return this.currentUser();
  }

  // COMPROBAR EL ROL DEL USUARIO
  hasRole(
    role: 'cliente' | 'agente' | 'administrador'
  ): boolean {

    const user = this.currentUser();

    return user?.rol === role;
  }
}
