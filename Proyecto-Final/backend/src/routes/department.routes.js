
import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller.js';

const router = Router();

// Consultar todos los departamentos
router.get('/', DepartmentController.getAll);

// Consultar departamentos de un país
router.get(
  '/country/:countryId',
  DepartmentController.getByCountry
);

// Consultar un departamento por ID
router.get('/:id', DepartmentController.getById);

// Crear un departamento
router.post('/', DepartmentController.create);

// Actualizar un departamento
router.put('/:id', DepartmentController.update);

// Eliminar un departamento
router.delete('/:id', DepartmentController.delete);

export default router;
