
import {
  randomBytes,
  scrypt,
  timingSafeEqual
} from 'node:crypto';

import { promisify } from 'node:util';
import jwt from 'jsonwebtoken';

import { UserModel } from '../models/user.model.js';
import { CityModel } from '../models/city.model.js';

const scryptAsync = promisify(scrypt);

// Crear errores HTTP
function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Generar un hash seguro de la contraseña
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');

  const derivedKey = await scryptAsync(
    password,
    salt,
    64
  );

  return `${salt}:${derivedKey.toString('hex')}`;
}

// Verificar contraseña
async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') {
    return false;
  }

  const [salt, key] = storedHash.split(':');

  if (
    !/^[0-9a-f]{32}$/i.test(salt ?? '') ||
    !/^[0-9a-f]{128}$/i.test(key ?? '')
  ) {
    return false;
  }

  const storedKey = Buffer.from(key, 'hex');

  const derivedKey = await scryptAsync(
    password,
    salt,
    storedKey.length
  );

  return timingSafeEqual(storedKey, derivedKey);
}

// Validar los datos del registro
export function validateRegister(data) {
  const nombre = data?.nombre;
  const email = data?.email;
  const password = data?.password;
  const cityId = data?.city_id;

  if (
    typeof nombre !== 'string' ||
    nombre.trim().length < 2 ||
    nombre.trim().length > 100
  ) {
    throw createError(
      'El nombre debe tener entre 2 y 100 caracteres',
      400
    );
  }

  if (
    typeof email !== 'string' ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw createError(
      'El correo electrónico no es válido',
      400
    );
  }

  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    password.length > 128
  ) {
    throw createError(
      'La contraseña debe tener entre 8 y 128 caracteres',
      400
    );
  }

  if (
    !Number.isSafeInteger(cityId) ||
    cityId <= 0
  ) {
    throw createError(
      'Debes seleccionar una ciudad válida',
      400
    );
  }

  if (!CityModel.findById(cityId)) {
    throw createError(
      'La ciudad seleccionada no existe',
      404
    );
  }

  return {
    nombre: nombre.trim(),
    email: email.trim().toLowerCase(),
    password,
    city_id: cityId
  };
}

// Servicio de autenticación
export const AuthService = {

  // Registrar usuarios
  async register(data) {
    const validated = validateRegister(data);

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
        rol: 'cliente',
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

  // Iniciar sesión
  async login(data) {
    const email = data?.email;
    const password = data?.password;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      throw createError(
        'Correo y contraseña son obligatorios',
        400
      );
    }

    const user = UserModel.findByEmail(
      email.trim().toLowerCase()
    );

    if (!user) {
      throw createError(
        'Credenciales incorrectas',
        401
      );
    }

    const validPassword = await verifyPassword(
      password,
      user.password_hash
    );

    if (!validPassword) {
      throw createError(
        'Credenciales incorrectas',
        401
      );
    }

    if (!process.env.JWT_SECRET) {
      throw createError(
        'La autenticación no está configurada',
        500
      );
    }

    // Excluir el hash de la contraseña
    const { password_hash, ...safeUser } = user;

    // Generar token JWT
    const token = jwt.sign(
      {
        sub: String(user.id),
        rol: user.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        algorithm: 'HS256'
      }
    );

    return {
      usuario: safeUser,
      token
    };
  }
};
