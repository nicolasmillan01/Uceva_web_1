
import { Router } from 'express';
import type { DatabaseSync } from 'node:sqlite';

import {
  ReservationController
} from '../controllers/reservation.controller.js';

export function createReservationRoutes(
  db: DatabaseSync
): Router {

  const router = Router();
  const controller = new ReservationController(db);

  // Consultar reservas del cliente autenticado.
  router.get(
    '/mine',
    controller.byUser
  );

  // Consultar todas las reservas de los eventos del agente.
  router.get(
    '/agent',
    controller.byAgent
  );

  // Consultar reservas de un evento específico del agente.
  router.get(
    '/agent/event/:eventoCodigo',
    controller.byAgentEvent
  );

  // Consultar todas las reservas (administrador).
  router.get(
    '/',
    controller.all
  );

  // Crear una reserva.
  router.post(
    '/',
    controller.create
  );

  // Consultar una reserva por código.
  router.get(
    '/:id',
    controller.byId
  );

  // Actualizar una reserva.
  router.put(
    '/:id',
    controller.update
  );

  // Eliminar una reserva (administrador).
  router.delete(
    '/:id',
    controller.delete
  );

  return router;
}
