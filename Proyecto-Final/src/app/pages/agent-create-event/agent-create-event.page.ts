
import { Component, OnInit, inject } from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { finalize } from 'rxjs';

import { EventsService } from '../../services/events.service';

import {
  Event,
  EventState
} from '../../interfaces/event.interface';

@Component({
  selector: 'app-agent-create-event.page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './agent-create-event.page.html',
  styleUrl: './agent-create-event.page.scss',
})
export class AgentCreateEventPage implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly eventsService = inject(EventsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  guardando = false;
  cargando = false;

  error = '';
  exito = '';

  modoEdicion = false;
  codigoEvento: number | null = null;

  formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    teatro: ['', Validators.required],
    ciudad: ['', Validators.required],

    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],

    capacidad: [
      1,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    precio: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],

    observaciones: [''],

    estado: [
      'Programado' as EventState,
      Validators.required
    ]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id !== null) {
      const codigo = Number(id);

      if (!Number.isSafeInteger(codigo) || codigo < 1) {
        this.error = 'El identificador del evento es inválido.';
        return;
      }

      this.modoEdicion = true;
      this.codigoEvento = codigo;

      this.cargarEvento(codigo);
    }
  }

  // Convertir una fecha ISO al formato datetime-local.
  private formatearFecha(fecha: Date | string): string {
    const valor = new Date(fecha);

    if (!Number.isFinite(valor.getTime())) {
      return '';
    }

    const completar = (numero: number): string =>
      numero.toString().padStart(2, '0');

    return (
      `${valor.getFullYear()}-` +
      `${completar(valor.getMonth() + 1)}-` +
      `${completar(valor.getDate())}T` +
      `${completar(valor.getHours())}:` +
      `${completar(valor.getMinutes())}`
    );
  }

  // Consultar un evento existente.
  cargarEvento(codigo: number): void {
    this.cargando = true;
    this.error = '';

    this.eventsService.getById(codigo)
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (evento: Event) => {
          this.formulario.patchValue({
            nombre: evento.nombre,
            descripcion: evento.descripcion,
            teatro: evento.teatro,
            ciudad: evento.ciudad,

            fecha_inicio: this.formatearFecha(
              evento.fecha_inicio
            ),

            fecha_fin: this.formatearFecha(
              evento.fecha_fin
            ),

            capacidad: evento.capacidad,
            precio: evento.precio,
            observaciones: evento.observaciones,
            estado: evento.estado
          });
        },

        error: (err) => {
          this.error =
            err.error?.error ||
            'No fue posible cargar el evento.';
        }
      });
  }

  // Crear o actualizar un evento.
  crearEvento(): void {
    this.error = '';
    this.exito = '';

    if (this.guardando || this.cargando) {
      return;
    }

    if (this.modoEdicion && this.codigoEvento === null) {
      this.error = 'No se identificó el evento a editar.';
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();

      this.error =
        'Completa correctamente los campos obligatorios.';

      return;
    }

    const datos = this.formulario.getRawValue();

    const inicio = new Date(datos.fecha_inicio);
    const fin = new Date(datos.fecha_fin);

    if (
      !Number.isFinite(inicio.getTime()) ||
      !Number.isFinite(fin.getTime()) ||
      fin <= inicio
    ) {
      this.error =
        'La fecha de finalización debe ser posterior al inicio.';

      return;
    }

    const evento: Omit<Event, 'codigo'> = {
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      teatro: datos.teatro.trim(),
      ciudad: datos.ciudad.trim(),

      fecha_inicio: inicio,
      fecha_fin: fin,

      capacidad: datos.capacidad,
      precio: datos.precio,

      observaciones: datos.observaciones.trim(),
      estado: datos.estado
    };

    this.guardando = true;

    const peticion =
      this.modoEdicion && this.codigoEvento !== null
        ? this.eventsService.update(
            this.codigoEvento,
            evento
          )
        : this.eventsService.create(evento);

    peticion
      .pipe(
        finalize(() => {
          this.guardando = false;
        })
      )
      .subscribe({
        next: () => {
          this.exito = this.modoEdicion
            ? 'Evento actualizado correctamente.'
            : 'Evento creado correctamente.';

          this.router.navigate(['/agent/events']);
        },

        error: (err) => {
          this.error =
            err.error?.error ||
            'No fue posible guardar el evento.';
        }
      });
  }

  // Limpiar o restaurar el formulario.
  limpiar(): void {
    this.error = '';
    this.exito = '';

    if (
      this.modoEdicion &&
      this.codigoEvento !== null
    ) {
      this.cargarEvento(this.codigoEvento);
    } else {
      this.formulario.reset();
    }
  }
}
