
import { CityModel } from '../models/city.model.js';
import { DepartmentModel } from '../models/department.model.js';

// Crear errores con un código HTTP
function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Validar identificadores
function validateId(id, campo = 'El ID') {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError(
      `${campo} debe ser un entero positivo`,
      400
    );
  }
}

// Validar datos de una ciudad
function validateData(data) {
  if (
    typeof data?.nombre !== 'string' ||
    !data.nombre.trim()
  ) {
    throw createError(
      'El nombre de la ciudad es obligatorio',
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

  const departmentId = data.department_id;

  validateId(departmentId, 'El ID del departamento');

  // Comprobar que el departamento existe
  if (!DepartmentModel.findById(departmentId)) {
    throw createError(
      'El departamento no existe',
      404
    );
  }

  return { nombre, departmentId };
}

// Controlar errores de SQLite
function handleDatabaseError(error) {
  if (error.code === 'ERR_SQLITE_ERROR') {

    if (error.message.includes('UNIQUE constraint failed')) {
      throw createError(
        'Esta ciudad ya existe en el departamento',
        409
      );
    }

    if (error.message.includes('FOREIGN KEY constraint failed')) {
      throw createError(
        'No se puede eliminar la ciudad porque tiene usuarios asociados',
        409
      );
    }
  }

  throw error;
}

export const CityService = {

  // Consultar todas las ciudades
  getAll() {
    return CityModel.findAll();
  },

  // Consultar una ciudad por ID
  getById(id) {
    validateId(id);

    const city = CityModel.findById(id);

    if (!city) {
      throw createError(
        'Ciudad no encontrada',
        404
      );
    }

    return city;
  },

  // Consultar ciudades de un departamento
  getByDepartment(departmentId) {
    validateId(
      departmentId,
      'El ID del departamento'
    );

    if (!DepartmentModel.findById(departmentId)) {
      throw createError(
        'El departamento no existe',
        404
      );
    }

    return CityModel.findByDepartment(departmentId);
  },

  // Registrar una ciudad
  create(data) {
    const { nombre, departmentId } = validateData(data);

    try {
      return CityModel.create(nombre, departmentId);
    } catch (error) {
      handleDatabaseError(error);
    }
  },

  // Actualizar una ciudad
  update(id, data) {
    validateId(id);
    this.getById(id);

    const { nombre, departmentId } = validateData(data);

    try {
      return CityModel.update(
        id,
        nombre,
        departmentId
      );
    } catch (error) {
      handleDatabaseError(error);
    }
  },

  // Eliminar una ciudad
  delete(id) {
    validateId(id);
    this.getById(id);

    try {
      CityModel.delete(id);

      return {
        mensaje: 'Ciudad eliminada correctamente'
      };
    } catch (error) {
      handleDatabaseError(error);
    }
  }
};
