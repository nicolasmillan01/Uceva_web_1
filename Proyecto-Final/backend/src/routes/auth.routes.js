
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Registro público
router.post('/register', AuthController.register);

// Inicio de sesión
router.post('/login', AuthController.login);

// Consultar la sesión actual
router.get('/me', authenticate, AuthController.me);

export default router;
