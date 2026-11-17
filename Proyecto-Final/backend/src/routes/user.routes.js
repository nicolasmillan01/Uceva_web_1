
import { Router } from 'express';

import {
  UserController
} from '../controllers/user.controller.js';

import {
  authenticate,
  authorize
} from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
// y rol de administrador
router.use(
  authenticate,
  authorize('administrador')
);

// Consultar todos los usuarios
router.get('/', UserController.getAll);

// Consultar un usuario por ID
router.get('/:id', UserController.getById);

// Crear un usuario
router.post('/', UserController.create);

// Actualizar usuario
router.put('/:id', UserController.update);

// Eliminar usuario
router.delete('/:id', UserController.delete);

export default router;
