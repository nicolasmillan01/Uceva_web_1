
import { Router } from 'express';
import { CityController } from '../controllers/city.controller.js';

import {
  authenticate,
  authorize
} from '../middlewares/auth.middleware.js';

const router = Router();

// Consultas públicas
router.get('/', CityController.getAll);

router.get(
  '/department/:departmentId',
  CityController.getByDepartment
);

router.get('/:id', CityController.getById);

// Operaciones exclusivas del administrador
router.post(
  '/',
  authenticate,
  authorize('administrador'),
  CityController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('administrador'),
  CityController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('administrador'),
  CityController.delete
);

export default router;
