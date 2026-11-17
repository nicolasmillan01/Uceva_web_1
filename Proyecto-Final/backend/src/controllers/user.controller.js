
import { UserService } from '../services/user.service.js';

// Manejar errores de las operaciones CRUD
function handleError(res, error) {
  const status = error.status || 500;

  if (status >= 500) {
    console.error('Error en usuarios:', error);
  }

  return res.status(status).json({
    error: status >= 500
      ? 'Error interno del servidor'
      : error.message
  });
}

export const UserController = {

  // GET /api/users
  // Consultar todos los usuarios
  getAll(req, res) {
    try {
      const usuarios = UserService.getAll();

      return res.status(200).json(usuarios);
    } catch (error) {
      return handleError(res, error);
    }
  },

  // GET /api/users/:id
  // Consultar un usuario por su ID
  getById(req, res) {
    try {
      const usuario = UserService.getById(
        req.params.id
      );

      return res.status(200).json(usuario);
    } catch (error) {
      return handleError(res, error);
    }
  },

  // POST /api/users
  // Crear cliente, agente o administrador
  async create(req, res) {
    try {
      const usuario = await UserService.create(
        req.body
      );

      return res.status(201).json({
        message: 'Usuario creado correctamente',
        usuario
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  // PUT /api/users/:id
  // Actualizar información y rol
  update(req, res) {
    try {
      const usuario = UserService.update(
        req.params.id,
        req.body,
        req.user.id
      );

      return res.status(200).json({
        message: 'Usuario actualizado correctamente',
        usuario
      });
    } catch (error) {
      return handleError(res, error);
    }
  },

  // DELETE /api/users/:id
  // Eliminar un usuario
  delete(req, res) {
    try {
      const result = UserService.delete(
        req.params.id,
        req.user.id
      );

      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  }
};
