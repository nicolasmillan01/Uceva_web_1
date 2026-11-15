
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import {
  AuthService,
  RegisterData
} from '../../services/auth.service';

interface LocationItem {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-register.page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss'
})
export class RegisterPage implements OnInit {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  private apiUrl = 'http://localhost:3000/api';

  // Datos del usuario
  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';

  // Ubicación
  country_id: number | null = null;
  department_id: number | null = null;
  city_id: number | null = null;

  countries: LocationItem[] = [];
  departments: LocationItem[] = [];
  cities: LocationItem[] = [];

  // Estados del formulario
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    this.loadCountries();
  }

  // Adaptar listas recibidas desde el backend
  private extractList(response: any): LocationItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    const possibleList =
      response?.data ??
      response?.countries ??
      response?.departments ??
      response?.cities;

    return Array.isArray(possibleList)
      ? possibleList
      : [];
  }

  // Obtener países
  loadCountries(): void {
    this.http.get<unknown>(
      `${this.apiUrl}/countries`
    ).subscribe({
      next: (response) => {
        this.countries = this.extractList(response);
      },
      error: () => {
        this.errorMessage.set(
          'No se pudieron cargar los países'
        );
      }
    });
  }

  // Cuando cambia el país
  onCountryChange(): void {
    this.department_id = null;
    this.city_id = null;
    this.departments = [];
    this.cities = [];

    if (this.country_id === null) {
      return;
    }

    this.http.get<unknown>(
      `${this.apiUrl}/departments/country/${this.country_id}`
    ).subscribe({
      next: (response) => {
        this.departments = this.extractList(response);
      },
      error: () => {
        this.errorMessage.set(
          'No se pudieron cargar los departamentos'
        );
      }
    });
  }

  // Cuando cambia el departamento
  onDepartmentChange(): void {
    this.city_id = null;
    this.cities = [];

    if (this.department_id === null) {
      return;
    }

    this.http.get<unknown>(
      `${this.apiUrl}/cities/department/${this.department_id}`
    ).subscribe({
      next: (response) => {
        this.cities = this.extractList(response);
      },
      error: () => {
        this.errorMessage.set(
          'No se pudieron cargar las ciudades'
        );
      }
    });
  }

  // Registrar una nueva cuenta
  register(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    if (
      !this.nombre.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword ||
      this.city_id === null
    ) {
      this.errorMessage.set(
        'Completa todos los campos obligatorios'
      );
      return;
    }

    if (
      this.password.length < 8 ||
      this.password.length > 128
    ) {
      this.errorMessage.set(
        'La contraseña debe tener entre 8 y 128 caracteres'
      );
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set(
        'Las contraseñas no coinciden'
      );
      return;
    }

    const data: RegisterData = {
      nombre: this.nombre.trim(),
      email: this.email.trim(),
      password: this.password,
      city_id: this.city_id
    };

    this.loading.set(true);

    this.authService.register(data).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set(
          'Cuenta creada correctamente'
        );

        this.router.navigateByUrl('/login');
      },

      error: (error) => {
        this.loading.set(false);

        if (error.status === 409) {
          this.errorMessage.set(
            'Este correo electrónico ya está registrado'
          );
        } else if (error.status === 400) {
          this.errorMessage.set(
            error.error?.message ||
            error.error?.error ||
            'Los datos ingresados no son válidos'
          );
        } else if (error.status === 0) {
          this.errorMessage.set(
            'No se pudo conectar con el servidor'
          );
        } else {
          this.errorMessage.set(
            'No se pudo completar el registro'
          );
        }
      }
    });
  }
}
