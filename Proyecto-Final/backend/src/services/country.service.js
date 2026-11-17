
import { CountryModel } from '../models/country.model.js';

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateId(id) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError('El ID debe ser un entero positivo', 400);
  }
}

function validateNombre(data) {
  if (
    typeof data?.nombre !== 'string' ||
    !data.nombre.trim()
  ) {
    throw createError('El nombre es obligatorio', 400);
  }

  const nombre = data.nombre.trim();

  if (nombre.length > 100) {
    throw createError(
      'El nombre no puede superar 100 caracteres',
      400
    );
  }

  return nombre;
}

function handleDatabaseError(error) {
  if (error.code === 'ERR_SQLITE_ERROR') {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw createError('Este país ya está registrado', 409);
    }

    if (error.message.includes('FOREIGN KEY constraint failed')) {
      throw createError(
        'No se puede eliminar el país porque tiene departamentos asociados',
        409
      );
    }
  }

  throw error;
}

export const CountryService = {

  getAll() {
    return CountryModel.findAll();
  },

  getById(id) {
    validateId(id);

    const country = CountryModel.findById(id);

    if (!country) {
      throw createError('País no encontrado', 404);
    }

    return country;
  },

  create(data) {
    const nombre = validateNombre(data);

    try {
      return CountryModel.create(nombre);
    } catch (error) {
      handleDatabaseError(error);
    }
  },

  update(id, data) {
    validateId(id);
    const nombre = validateNombre(data);

    this.getById(id);

    try {
      return CountryModel.update(id, nombre);
    } catch (error) {
      handleDatabaseError(error);
    }
  },

  delete(id) {
    validateId(id);
    this.getById(id);

    try {
      CountryModel.delete(id);

      return {
        mensaje: 'País eliminado correctamente'
      };
    } catch (error) {
      handleDatabaseError(error);
    }
  }
};
