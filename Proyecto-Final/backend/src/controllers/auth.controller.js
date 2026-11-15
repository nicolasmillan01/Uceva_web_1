
import { AuthService } from '../services/auth.service.js';

export const AuthController = {

  // Registrar usuario
  async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);

      res.status(201).json({
        mensaje: 'Usuario registrado correctamente',
        usuario: user
      });
    } catch (error) {
      next(error);
    }
  },

  // Iniciar sesión
  async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);

      res.status(200).json({
        mensaje: 'Inicio de sesión exitoso',
        usuario: result.usuario,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  },

  // Consultar usuario autenticado
  me(req, res) {
    res.status(200).json({
      usuario: req.user
    });
  }
};
