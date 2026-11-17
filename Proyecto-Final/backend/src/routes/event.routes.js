
import { Router } from 'express';

import { EventController as c } from '../controllers/event.controller.js';

import {
  authenticate,
  authorize
} from '../middlewares/auth.middleware.js';

const router = Router();

// Consulta pública de eventos.

// Consulta pública de eventos.
router.get('/', c.all);

// Consulta de eventos propios.
// Debe estar antes de /:id.
router.get(
  '/mine',
  authenticate,
  authorize('agente', 'administrador'),
  c.mine
);

// Consulta de un evento por ID.
router.get('/:id', c.byId);


// Crear eventos.
router.post(
  '/',
  authenticate,
  authorize('agente', 'administrador'),
  c.create
);

// Modificar eventos.
router.put(
  '/:id',
  authenticate,
  authorize('agente', 'administrador'),
  c.update
);

// Eliminar eventos.
router.delete(
  '/:id',
  authenticate,
  authorize('agente', 'administrador'),
  c.delete
);

export default router;
