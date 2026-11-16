
import { Router } from 'express';
import type { DatabaseSync } from 'node:sqlite';

import { ReservationController } from '../controllers/reservation.controller.js';

export function createReservationRoutes(
  db: DatabaseSync
): Router {

  const router = Router();
  const controller = new ReservationController(db);

  // Consultar reservas del usuario autenticado.
  router.get(
    '/mine',
    controller.byUser
  );

  // Consultar todas las reservas.
  router.get(
    '/',
    controller.all
  );

  // Consultar una reserva por su código.
  router.get(
    '/:id',
    controller.byId
  );

  // Crear una reserva.
  router.post(
    '/',
    controller.create
  );

  // Actualizar una reserva.
  router.put(
    '/:id',
    controller.update
  );

  // Eliminar una reserva.
  router.delete(
    '/:id',
    controller.delete
  );

  return router;
}
