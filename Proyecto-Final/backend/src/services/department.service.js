
import { DepartmentModel } from '../models/department.model.js';
import { CountryModel } from '../models/country.model.js';

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateId(id, campo = 'ID') {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError(
      `${campo} debe ser un entero positivo`,
      400
    );
  }
}

function validateData(data) {
  if (
    typeof data?.nombre !== 'string' ||
    !data.nombre.trim()
  ) {
    throw createError(
      'El nombre del departamento es obligatorio',
      400
    );
  }

  const nombre = data.nombre.trim();

  if (nombre.length > 100) {
    throw createError(
      'El nombre no puede superar 100 caracteres',
      400
    );
  }

  const countryId = data.country_id;

  validateId(countryId, 'El ID del país');

  if (!CountryModel.findById(countryId)) {
    throw createError('El país no existe', 404);
  }

  return { nombre, countryId };
}

function handleDatabaseError(error) {
  if (error.code === 'ERR_SQLITE_ERROR') {
    if (error.message.includes('UNIQUE constraint failed')) {
      throw createError(
        'Este departamento ya existe en el país',
        409
      );
    }

    if (error.message.includes('FOREIGN KEY constraint failed')) {
      throw createError(
        'No se puede eliminar el departamento porque tiene ciudades asociadas',
        409
      );
    }
  }

  throw error;
}

export const DepartmentService = {

  getAll() {
    return DepartmentModel.findAll();
  },

  getById(id) {
    validateId(id);

    const department = DepartmentModel.findById(id);

    if (!department) {
      throw createError('Departamento no encontrado', 404);
    }

    return department;
  },

  getByCountry(countryId) {
    validateId(countryId, 'El ID del país');

    if (!CountryModel.findById(countryId)) {
      throw createError('El país no existe', 404);
    }

    return DepartmentModel.findByCountry(countryId);
  },

  create(data) {
    const { nombre, countryId } = validateData(data);

    try {
      return DepartmentModel.create(nombre, countryId);
    } catch (error) {
      handleDatabaseError(error);
    }
  },

  update(id, data) {
    validateId(id);
    this.getById(id);

    const { nombre, countryId } = validateData(data);

    try {
      return DepartmentModel.update(id, nombre, countryId);
    } catch (error) {
      handleDatabaseError(error);
    }
  },

  delete(id) {
    validateId(id);
    this.getById(id);

    try {
      DepartmentModel.delete(id);

      return {
        mensaje: 'Departamento eliminado correctamente'
      };
    } catch (error) {
      handleDatabaseError(error);
    }
  }
};
