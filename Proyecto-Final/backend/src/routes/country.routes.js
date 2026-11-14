
import { Router } from 'express';
import { CountryController } from '../controllers/country.controller.js';

const router = Router();

// Consultar todos los países
router.get('/', CountryController.getAll);

// Consultar un país por su ID
router.get('/:id', CountryController.getById);

// Registrar un país
router.post('/', CountryController.create);

// Actualizar un país
router.put('/:id', CountryController.update);

// Eliminar un país
router.delete('/:id', CountryController.delete);

export default router;
