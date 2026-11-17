
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface UserReport {
  total: number;
  clientes: number;
  agentes: number;
  administradores: number;
}

export interface EventReport {
  total: number;
  programados: number;
  enBoleteria: number;
  enVivo: number;
  finalizados: number;
  cancelados: number;
}

export interface ReservationReport {
  total: number;
  pendientes: number;
  confirmadas: number;
  canceladas: number;
  entradasActivas: number;
  entradasPendientes: number;
  entradasConfirmadas: number;
  ingresosConfirmados: number;
}

export interface TopEventReport {
  codigo: number;
  nombre: string;
  teatro: string;
  ciudad: string;
  estado: string;
  capacidad: number;
  totalReservas: number;
  entradasConfirmadas: number;
  entradasPendientes: number;
  ingresos: number;
}

export interface AdminReports {
  usuarios: UserReport;
  eventos: EventReport;
  reservas: ReservationReport;
  eventosMasReservados: TopEventReport[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminReportsService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private apiUrl = 'http://localhost:3000/api/admin/reports';

  getReports(): Observable<AdminReports> {

    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<AdminReports>(
      this.apiUrl,
      { headers }
    );
  }
}
