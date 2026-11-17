
import { UserModel } from '../models/user.model.js';
import { CityModel } from '../models/city.model.js';

import {
  hashPassword,
  validateRegister
} from './auth.service.js';

// Roles permitidos en EventApp
const ROLES = [
  'cliente',
  'agente',
  'administrador'
];

// Crear errores HTTP
function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Validar identificadores
function validateId(id) {
  const numericId = Number(id);

  if (
    !Number.isSafeInteger(numericId) ||
    numericId <= 0
  ) {
    throw createError(
      'El ID del usuario no es válido',
      400
    );
  }

  return numericId;
}

// Validar roles
function validateRole(rol) {
  if (!ROLES.includes(rol)) {
    throw createError(
      'El rol debe ser cliente, agente o administrador',
      400
    );
  }

  return rol;
}

export const UserService = {

  // GET: consultar todos los usuarios
  getAll() {
    return UserModel.findAll();
  },

  // GET: consultar usuario por ID
  getById(id) {
    const userId = validateId(id);

    const user = UserModel.findById(userId);

    if (!user) {
      throw createError(
        'Usuario no encontrado',
        404
      );
    }

    return user;
  },

  // POST: crear usuario con un rol
  async create(data) {
    const validated = validateRegister(data);

    const rol = validateRole(
      data?.rol ?? 'cliente'
    );

    const existingUser = UserModel.findByEmail(
      validated.email
    );

    if (existingUser) {
      throw createError(
        'Este correo ya está registrado',
        409
      );
    }

    const password_hash = await hashPassword(
      validated.password
    );

    try {
      return UserModel.create({
        nombre: validated.nombre,
        email: validated.email,
        password_hash,
        rol,
        city_id: validated.city_id
      });
    } catch (error) {
      if (
        error.message?.includes(
          'UNIQUE constraint failed'
        )
      ) {
        throw createError(
          'Este correo ya está registrado',
          409
        );
      }

      throw error;
    }
  },

  // PUT: actualizar datos y rol
  update(id, data, administratorId) {
    const userId = validateId(id);

    const existingUser = this.getById(userId);

    if (
      !data ||
      typeof data !== 'object' ||
      Array.isArray(data)
    ) {
      throw createError(
        'Debes enviar los datos del usuario',
        400
      );
    }

    // Conservar los datos existentes
    let nombre = existingUser.nombre;
    let city_id = existingUser.city_id;
    let rol = existingUser.rol;

    // Validar nombre, cuando se envía
    if (data.nombre !== undefined) {
      if (
        typeof data.nombre !== 'string' ||
        data.nombre.trim().length < 2 ||
        data.nombre.trim().length > 100
      ) {
        throw createError(
          'El nombre debe tener entre 2 y 100 caracteres',
          400
        );
      }

      nombre = data.nombre.trim();
    }

    // Validar ciudad, cuando se envía
    if (data.city_id !== undefined) {
      if (
        !Number.isSafeInteger(data.city_id) ||
        data.city_id <= 0
      ) {
        throw createError(
          'Debes seleccionar una ciudad válida',
          400
        );
      }

      if (!CityModel.findById(data.city_id)) {
        throw createError(
          'La ciudad seleccionada no existe',
          404
        );
      }

      city_id = data.city_id;
    }

    // Validar rol, cuando se envía
    if (data.rol !== undefined) {
      rol = validateRole(data.rol);
    }

    // Evitar que el administrador elimine
    // sus propios permisos accidentalmente
    if (
      userId === Number(administratorId) &&
      rol !== 'administrador'
    ) {
      throw createError(
        'No puedes quitarte tu propio rol de administrador',
        403
      );
    }

    // Actualizar nombre y ciudad
    UserModel.update(userId, {
      nombre,
      city_id
    });

    // Actualizar rol solamente si cambia
    if (rol !== existingUser.rol) {
      UserModel.updateRole(userId, rol);
    }

    return this.getById(userId);
  },

  // DELETE: eliminar usuario
  delete(id, administratorId) {
    const userId = validateId(id);

    this.getById(userId);

    // Impedir que elimine su propia cuenta
    if (userId === Number(administratorId)) {
      throw createError(
        'No puedes eliminar tu propia cuenta de administrador',
        403
      );
    }

    try {
      UserModel.delete(userId);
    } catch (error) {
      if (
        error.message?.includes(
          'FOREIGN KEY constraint failed'
        )
      ) {
        throw createError(
          'No se puede eliminar el usuario porque tiene registros relacionados',
          409
        );
      }

      throw error;
    }

    return {
      message: 'Usuario eliminado correctamente'
    };
  }
};
