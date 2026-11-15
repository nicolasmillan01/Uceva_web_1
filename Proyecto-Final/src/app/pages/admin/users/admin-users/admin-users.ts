
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, switchMap } from 'rxjs';

import { NavbarComponent } from '../../../../components/navbar/navbar.component';

import {
  UserService,
  User,
  CreateUserData,
  UpdateUserData
} from '../../../../services/user.service';

type UserRole = 'cliente' | 'agente' | 'administrador';

// Datos básicos de una ubicación
interface LocationItem {
  id: number;
  nombre: string;
}

// Relaciones de la base de datos
interface CityDetail extends LocationItem {
  department_id: number;
}

interface DepartmentDetail extends LocationItem {
  country_id: number;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss'
})
export class AdminUsers implements OnInit {

  private userService = inject(UserService);
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api';

  // LISTADO DE USUARIOS
  usuarios: User[] = [];

  // ESTADOS
  loading = false;
  saving = false;
  loadingLocation = false;

  errorMessage = '';
  successMessage = '';

  mostrarFormulario = false;
  editando = false;
  usuarioId: number | null = null;

  // DATOS DEL FORMULARIO
  formulario = {
    nombre: '',
    email: '',
    password: '',
    rol: 'cliente' as UserRole,
    city_id: 0
  };

  // LISTAS DE LOCALIZACIÓN
  paises: LocationItem[] = [];
  departamentos: LocationItem[] = [];
  ciudades: LocationItem[] = [];

  // UBICACIÓN SELECCIONADA
  paisSeleccionado: number | null = null;
  departamentoSeleccionado: number | null = null;

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarPaises();
  }

  // ===================================
  // CONSULTAR TODOS LOS USUARIOS
  // ===================================
  cargarUsuarios(): void {
    this.loading = true;

    this.userService.getAll().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.error ||
          'No se pudieron cargar los usuarios.';
      }
    });
  }

  // ===================================
  // OBTENER LOS PAÍSES
  // ===================================
  cargarPaises(): void {
    this.http.get<LocationItem[]>(
      `${this.apiUrl}/countries`
    ).subscribe({
      next: (data) => {
        this.paises = data;
      },
      error: () => {
        this.errorMessage =
          'No se pudieron cargar los países.';
      }
    });
  }

  // ===================================
  // CAMBIAR PAÍS
  // ===================================
  cambiarPais(): void {
    this.departamentos = [];
    this.ciudades = [];

    this.departamentoSeleccionado = null;
    this.formulario.city_id = 0;

    if (this.paisSeleccionado === null) {
      return;
    }

    const countryId = this.paisSeleccionado;

    this.http.get<LocationItem[]>(
      `${this.apiUrl}/departments/country/${countryId}`
    ).subscribe({
      next: (data) => {
        // Evitar mostrar una selección anterior
        if (this.paisSeleccionado !== countryId) {
          return;
        }

        this.departamentos = data;
      },
      error: () => {
        this.errorMessage =
          'No se pudieron cargar los departamentos.';
      }
    });
  }

  // ===================================
  // CAMBIAR DEPARTAMENTO
  // ===================================
  cambiarDepartamento(): void {
    this.ciudades = [];
    this.formulario.city_id = 0;

    if (this.departamentoSeleccionado === null) {
      return;
    }

    const departmentId = this.departamentoSeleccionado;

    this.http.get<LocationItem[]>(
      `${this.apiUrl}/cities/department/${departmentId}`
    ).subscribe({
      next: (data) => {
        if (
          this.departamentoSeleccionado !== departmentId
        ) {
          return;
        }

        this.ciudades = data;
      },
      error: () => {
        this.errorMessage =
          'No se pudieron cargar las ciudades.';
      }
    });
  }

  // ===================================
  // CREAR NUEVO USUARIO
  // ===================================
  nuevoUsuario(): void {
    this.editando = false;
    this.usuarioId = null;

    this.formulario = {
      nombre: '',
      email: '',
      password: '',
      rol: 'cliente',
      city_id: 0
    };

    this.paisSeleccionado = null;
    this.departamentoSeleccionado = null;

    this.departamentos = [];
    this.ciudades = [];

    this.loadingLocation = false;

    this.errorMessage = '';
    this.successMessage = '';

    this.mostrarFormulario = true;
  }

  // ===================================
  // EDITAR USUARIO
  // ===================================
  editarUsuario(usuario: User): void {

    this.editando = true;
    this.usuarioId = usuario.id;

    this.formulario = {
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      city_id: usuario.city_id
    };

    this.paisSeleccionado = null;
    this.departamentoSeleccionado = null;

    this.departamentos = [];
    this.ciudades = [];

    this.errorMessage = '';
    this.successMessage = '';
    this.loadingLocation = true;

    this.mostrarFormulario = true;

    const selectedUserId = usuario.id;

    // Primero consultar la ciudad guardada
    this.http.get<CityDetail>(
      `${this.apiUrl}/cities/${usuario.city_id}`
    ).pipe(

      // Después consultar su departamento
      switchMap((ciudad) => {
        return this.http.get<DepartmentDetail>(
          `${this.apiUrl}/departments/${ciudad.department_id}`
        ).pipe(
          switchMap((departamento) => {

            // Finalmente cargar las listas necesarias
            return forkJoin({
              departamento: this.http.get<LocationItem[]>(
                `${this.apiUrl}/departments/country/${departamento.country_id}`
              ),

              ciudades: this.http.get<LocationItem[]>(
                `${this.apiUrl}/cities/department/${departamento.id}`
              )
            }).pipe(
              switchMap((listas) => {
                return [{
                  countryId: departamento.country_id,
                  departmentId: departamento.id,
                  departamentos: listas.departamento,
                  ciudades: listas.ciudades
                }];
              })
            );
          })
        );
      })

    ).subscribe({
      next: (ubicacion) => {

        // Ignorar respuestas de un formulario anterior
        if (
          !this.mostrarFormulario ||
          !this.editando ||
          this.usuarioId !== selectedUserId
        ) {
          return;
        }

        this.paisSeleccionado = ubicacion.countryId;
        this.departamentoSeleccionado =
          ubicacion.departmentId;

        this.departamentos = ubicacion.departamentos;
        this.ciudades = ubicacion.ciudades;

        this.loadingLocation = false;
      },

      error: () => {
        if (this.usuarioId !== selectedUserId) {
          return;
        }

        this.loadingLocation = false;
        this.errorMessage =
          'No se pudo recuperar la ubicación del usuario.';
      }
    });
  }

  // ===================================
  // CANCELAR FORMULARIO
  // ===================================
  cancelar(): void {
    this.mostrarFormulario = false;
    this.usuarioId = null;
    this.loadingLocation = false;
  }

  // ===================================
  // GUARDAR USUARIO
  // ===================================
  guardarUsuario(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.saving || this.loadingLocation) {
      return;
    }

    if (
      !this.formulario.nombre.trim() ||
      !Number.isSafeInteger(this.formulario.city_id) ||
      this.formulario.city_id <= 0
    ) {
      this.errorMessage =
        'Ingresa un nombre y selecciona una ciudad válida.';
      return;
    }

    // ACTUALIZAR USUARIO
    if (this.editando) {

      const id = this.usuarioId;

      if (id === null) {
        this.errorMessage =
          'No se ha seleccionado un usuario.';
        return;
      }

      const datos: UpdateUserData = {
        nombre: this.formulario.nombre.trim(),
        city_id: this.formulario.city_id,
        rol: this.formulario.rol
      };

      this.saving = true;

      this.userService.update(id, datos).subscribe({
        next: () => {
          this.saving = false;
          this.mostrarFormulario = false;

          this.cargarUsuarios();

          this.successMessage =
            'Usuario actualizado correctamente.';
        },

        error: (error) => {
          this.saving = false;

          this.errorMessage =
            error.error?.error ||
            'No se pudo actualizar el usuario.';
        }
      });

      return;
    }

    // CREAR USUARIO
    if (
      !this.formulario.email.trim() ||
      this.formulario.password.length < 8 ||
      this.formulario.password.length > 128
    ) {
      this.errorMessage =
        'Ingresa un correo y una contraseña de 8 a 128 caracteres.';
      return;
    }

    const datos: CreateUserData = {
      nombre: this.formulario.nombre.trim(),
      email: this.formulario.email.trim(),
      password: this.formulario.password,
      rol: this.formulario.rol,
      city_id: this.formulario.city_id
    };

    this.saving = true;

    this.userService.create(datos).subscribe({
      next: () => {
        this.saving = false;
        this.mostrarFormulario = false;

        this.cargarUsuarios();

        this.successMessage =
          'Usuario creado correctamente.';
      },

      error: (error) => {
        this.saving = false;

        this.errorMessage =
          error.error?.error ||
          'No se pudo crear el usuario.';
      }
    });
  }

  // ===================================
  // ELIMINAR USUARIO
  // ===================================
  eliminarUsuario(usuario: User): void {

    const confirmado = confirm(
      `¿Eliminar al usuario ${usuario.nombre}?`
    );

    if (!confirmado) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.userService.delete(usuario.id).subscribe({
      next: () => {
        this.cargarUsuarios();

        this.successMessage =
          'Usuario eliminado correctamente.';
      },

      error: (error) => {
        this.errorMessage =
          error.error?.error ||
          'No se pudo eliminar el usuario.';
      }
    });
  }
}
