
import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import { ReservationService } from '../src/services/reservation.service.js';
import { createReservationsTable } from '../src/migrations/002_reservations.js';

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

  db.prepare(`
    INSERT INTO users (id, rol)
    VALUES (?, ?)
  `).run(1, 'cliente');

  db.prepare(`
    INSERT INTO events (
      codigo, capacidad, precio, estado
    )
    VALUES (?, ?, ?, ?)
  `).run(1, 5, 30000, 'Programado');

  return db;
}

test('Debe crear una reserva correctamente', () => {
  const db = prepararBaseDeDatos();

  try {
    const service = new ReservationService(db);

    const reserva = service.create(1, 1, 2);

    assert.equal(reserva.usuario_id, 1);
    assert.equal(reserva.evento_codigo, 1);
    assert.equal(reserva.cantidad, 2);
    assert.equal(reserva.total, 60000);
    assert.equal(reserva.estado, 'Confirmada');

    assert.equal(service.getAll().length, 1);
  } finally {
    db.close();
  }
});

test('Debe impedir superar la capacidad del evento', () => {
  const db = prepararBaseDeDatos();

  try {
    const service = new ReservationService(db);

    service.create(1, 1, 4);

    assert.throws(
      () => service.create(1, 1, 2),
      /No hay suficientes cupos disponibles/
    );

    assert.equal(service.getAll().length, 1);
  } finally {
    db.close();
  }
});

test('Debe rechazar cantidades inválidas', () => {
  const db = prepararBaseDeDatos();

  try {
    const service = new ReservationService(db);

    assert.throws(() => service.create(1, 1, 0));
    assert.throws(() => service.create(1, 1, -2));
    assert.throws(() => service.create(1, 1, 1.5));

    assert.equal(service.getAll().length, 0);
  } finally {
    db.close();
  }
});

test('Debe liberar cupos cuando se cancela una reserva', () => {
  const db = prepararBaseDeDatos();

  try {
    const service = new ReservationService(db);

    const primera = service.create(1, 1, 5);

    service.update(
      primera.codigo,
      5,
      'Cancelada'
    );

    const segunda = service.create(1, 1, 5);

    assert.equal(segunda.estado, 'Confirmada');
    assert.equal(segunda.cantidad, 5);
    assert.equal(service.getAll().length, 2);
  } finally {
    db.close();
  }
});

test('Debe impedir reservas en eventos cancelados', () => {
  const db = prepararBaseDeDatos();

  try {
    const service = new ReservationService(db);

    db.prepare(`
      UPDATE events
      SET estado = ?
      WHERE codigo = ?
    `).run('Cancelado', 1);

    assert.throws(
      () => service.create(1, 1, 1),
      /No se permiten reservas para este evento/
    );

    assert.equal(service.getAll().length, 0);
  } finally {
    db.close();
  }
});

test('Debe rechazar usuarios inexistentes', () => {
  const db = prepararBaseDeDatos();

  try {
    const service = new ReservationService(db);

    assert.throws(
      () => service.create(999, 1, 1),
      /Cliente no válido/
    );

    assert.equal(service.getAll().length, 0);
  } finally {
    db.close();
  }
});

test('Debe impedir aumentar una reserva más allá de la capacidad', () => {
  const db = prepararBaseDeDatos();

  try {
    const service = new ReservationService(db);

    const primera = service.create(1, 1, 3);
    service.create(1, 1, 2);

    assert.throws(
      () => service.update(
        primera.codigo,
        4,
        'Confirmada'
      ),
      /No hay suficientes cupos disponibles/
    );

    const reserva = service.getById(primera.codigo);

    assert.equal(reserva.cantidad, 3);
    assert.equal(reserva.total, 90000);
    assert.equal(service.getAll().length, 2);
  } finally {
    db.close();
  }
});

test('Debe recalcular el precio al modificar entradas', () => {
  const db = prepararBaseDeDatos();

  try {
    const service = new ReservationService(db);

    const reserva = service.create(1, 1, 2);

    const actualizada = service.update(
      reserva.codigo,
      4,
      'Confirmada'
    );

    assert.equal(actualizada.cantidad, 4);
    assert.equal(actualizada.total, 120000);
  } finally {
    db.close();
  }
});

test('Debe impedir reservar para un evento inexistente', () => {
  const db = prepararBaseDeDatos();

  try {
    const service = new ReservationService(db);

    assert.throws(
      () => service.create(1, 999, 1),
      /Evento no encontrado/
    );

    assert.equal(service.getAll().length, 0);
  } finally {
    db.close();
  }
});

test('Debe impedir que un agente cree reservas como cliente', () => {
  const db = prepararBaseDeDatos();

  try {
    const service = new ReservationService(db);

    db.prepare(`
      INSERT INTO users (id, rol)
      VALUES (?, ?)
    `).run(2, 'agente');

    assert.throws(
      () => service.create(2, 1, 1),
      /Cliente no válido/
    );

    assert.equal(service.getAll().length, 0);
  } finally {
    db.close();
  }
});

test('Debe eliminar una reserva existente', () => {
  const db = prepararBaseDeDatos();

  try {
    const service = new ReservationService(db);

    const reserva = service.create(1, 1, 2);

    const eliminada = service.delete(reserva.codigo);

    assert.equal(eliminada, true);
    assert.equal(service.getAll().length, 0);
  } finally {
    db.close();
  }
});
