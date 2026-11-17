
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { NavbarComponent } from '../../../components/navbar/navbar.component';

import {
  AdminReportsService,
  AdminReports as AdminReportsData
} from '../../../services/admin-reports.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent
  ],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.scss'
})
export class AdminReports implements OnInit {

  private reportsService = inject(AdminReportsService);

  reportes: AdminReportsData | null = null;

  cargando = false;
  error = '';

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(): void {

    this.cargando = true;
    this.error = '';

    this.reportsService.getReports()
      .pipe(
        finalize(() => this.cargando = false)
      )
      .subscribe({

        next: (data) => {
          this.reportes = data;
        },

        error: (err: HttpErrorResponse) => {
          this.error =
            err.error?.error ||
            'No fue posible cargar los reportes.';
        }

      });
  }

  porcentaje(valor: number, total: number): number {

    if (!total || total <= 0) {
      return 0;
    }

    return Math.min((valor / total) * 100, 100);
  }
}
