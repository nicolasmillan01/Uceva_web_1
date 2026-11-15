
import { Router } from 'express';

import { CountryController } from '../controllers/country.controller.js';

import {
  authenticate,
  authorize
} from '../middlewares/auth.middleware.js';

const router = Router();

// CONSULTAS PÚBLICAS

// Consultar todos los países
router.get('/', CountryController.getAll);

// Consultar un país por ID
router.get('/:id', CountryController.getById);


// OPERACIONES PROTEGIDAS

// Crear país: solo administrador
router.post(
  '/',
  authenticate,
  authorize('administrador'),
  CountryController.create
);

// Actualizar país: solo administrador
router.put(
  '/:id',
  authenticate,
  authorize('administrador'),
  CountryController.update
);

// Eliminar país: solo administrador
router.delete(
  '/:id',
  authenticate,
  authorize('administrador'),
  CountryController.delete
);

export default router;
