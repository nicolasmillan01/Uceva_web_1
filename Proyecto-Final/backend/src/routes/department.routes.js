
import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller.js';

import {
  authenticate,
  authorize
} from '../middlewares/auth.middleware.js';

const router = Router();

// Consultas públicas
router.get('/', DepartmentController.getAll);

router.get(
  '/country/:countryId',
  DepartmentController.getByCountry
);

router.get('/:id', DepartmentController.getById);

// Operaciones exclusivas del administrador
router.post(
  '/',
  authenticate,
  authorize('administrador'),
  DepartmentController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('administrador'),
  DepartmentController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('administrador'),
  DepartmentController.delete
);

export default router;
