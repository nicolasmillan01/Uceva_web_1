
import { Router } from 'express';
import { CityController } from '../controllers/city.controller.js';

const router = Router();

// Consultar todas las ciudades
router.get('/', CityController.getAll);

// Consultar ciudades de un departamento
router.get(
  '/department/:departmentId',
  CityController.getByDepartment
);

// Consultar una ciudad por ID
router.get('/:id', CityController.getById);

// Registrar una ciudad
router.post('/', CityController.create);

// Actualizar una ciudad
router.put('/:id', CityController.update);

// Eliminar una ciudad
router.delete('/:id', CityController.delete);

export default router;
