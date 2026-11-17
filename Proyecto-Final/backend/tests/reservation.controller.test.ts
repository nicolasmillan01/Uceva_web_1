
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import type { Request, Response, NextFunction } from 'express';

import { ReservationController } from '../src/controllers/reservation.controller.js';
import { createReservationsTable } from '../src/migrations/002_reservations.js';

type Rol = 'cliente' | 'agente' | 'administrador';

interface UsuarioPrueba {
  id: number;
  rol: Rol;
}

function prepararBaseDeDatos(): DatabaseSync {
  const db = new DatabaseSync(':memory:');

  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      rol TEXT NOT NULL
    );

    CREATE TABLE events (
      codigo INTEGER PRIMARY KEY,
      capacidad INTEGER NOT NULL,
      precio REAL NOT NULL,
      estado TEXT NOT NULL
    );
  `);

  createReservationsTable(db);

  db.exec(`
    INSERT INTO users (id, rol) VALUES
      (1, 'cliente'),
      (2, 'cliente'),
      (3, 'agente'),
      (4, 'administrador');

    INSERT INTO events (
      codigo, capacidad, precio, estado
    ) VALUES (
      1, 10, 30000, 'Programado'
    );

    INSERT INTO reservations (
      codigo,
      usuario_id,
      evento_codigo,
      cantidad,
      total,
      estado
    ) VALUES (
      1, 1, 1, 2, 60000, 'Confirmada'
    );
  `);

  return db;
}

function ejecutar(
  controlador: ReservationController,
  metodo: 'update' | 'delete' | 'byId' | 'byUser',
  usuario: UsuarioPrueba | undefined,
  params: Record<string, string> = {},
  body: Record<string, unknown> = {}
): {
  status: number;
  data: unknown;
  error: Error & { status?: number } | null;
} {
  let status = 200;
  let data: unknown = null;
  let error: Error & { status?: number } | null = null;

  const req = {
    user: usuario,
    params,
    body
  } as unknown as Request;

  const res = {
    status(codigo: number) {
      status = codigo;
      return this;
    },
    json(valor: unknown) {
      data = valor;
      return this;
    },
    send() {
      return this;
    }
  } as unknown as Response;

  const next = ((err?: unknown) => {
    if (err instanceof Error) {
      error = err as Error & { status?: number };
    }
  }) as NextFunction;

  controlador[metodo](req, res, next);

  return { status, data, error };
}

test('Petición sin autenticación devuelve 401', () => {
  const db = prepararBaseDeDatos();

  try {
    const controller = new ReservationController(db);

    const resultado = ejecutar(
      controller,
      'byUser',
      undefined
    );

    assert.equal(resultado.error?.status, 401);
  } finally {
    db.close();
  }
});

test('Cliente no puede consultar reservas ajenas', () => {
  const db = prepararBaseDeDatos();

  try {
    const controller = new ReservationController(db);

    const resultado = ejecutar(
      controller,
      'byId',
      { id: 2, rol: 'cliente' },
      { id: '1' }
    );

    assert.equal(resultado.error?.status, 403);
  } finally {
    db.close();
  }
});

test('Cliente no puede confirmar arbitrariamente una reserva', () => {
  const db = prepararBaseDeDatos();

  try {
    const controller = new ReservationController(db);

    const resultado = ejecutar(
      controller,
      'update',
      { id: 1, rol: 'cliente' },
      { id: '1' },
      { cantidad: 2, estado: 'Confirmada' }
    );

    assert.equal(resultado.error?.status, 403);
  } finally {
    db.close();
  }
});

test('Cliente puede cancelar su propia reserva', () => {
  const db = prepararBaseDeDatos();

  try {
    const controller = new ReservationController(db);

    const resultado = ejecutar(
      controller,
      'update',
      { id: 1, rol: 'cliente' },
      { id: '1' },
      { cantidad: 2, estado: 'Cancelada' }
    );

    assert.equal(resultado.error, null);

    const reserva = db.prepare(`
      SELECT estado FROM reservations WHERE codigo = 1
    `).get() as { estado: string };

    assert.equal(reserva.estado, 'Cancelada');
  } finally {
    db.close();
  }
});

test('Cliente no puede eliminar reservas', () => {
  const db = prepararBaseDeDatos();

  try {
    const controller = new ReservationController(db);

    const resultado = ejecutar(
      controller,
      'delete',
      { id: 1, rol: 'cliente' },
      { id: '1' }
    );

    assert.equal(resultado.error?.status, 403);

    const cantidad = db.prepare(`
      SELECT COUNT(*) AS total FROM reservations
    `).get() as { total: number };

    assert.equal(cantidad.total, 1);
  } finally {
    db.close();
  }
});

test('Administrador puede eliminar una reserva', () => {
  const db = prepararBaseDeDatos();

  try {
    const controller = new ReservationController(db);

    const resultado = ejecutar(
      controller,
      'delete',
      { id: 4, rol: 'administrador' },
      { id: '1' }
    );

    assert.equal(resultado.error, null);
    assert.equal(resultado.status, 204);

    const cantidad = db.prepare(`
      SELECT COUNT(*) AS total FROM reservations
    `).get() as { total: number };

    assert.equal(cantidad.total, 0);
  } finally {
    db.close();
  }
});

test('Agente no puede eliminar reservas', () => {
  const db = prepararBaseDeDatos();

  try {
    const controller = new ReservationController(db);

    const resultado = ejecutar(
      controller,
      'delete',
      { id: 3, rol: 'agente' },
      { id: '1' }
    );

    assert.equal(resultado.error?.status, 403);
  } finally {
    db.close();
  }
});
