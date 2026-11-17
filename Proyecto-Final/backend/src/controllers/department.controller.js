
import { DepartmentService } from '../services/department.service.js';

export const DepartmentController = {

  // Consultar todos los departamentos
  getAll(req, res, next) {
    try {
      const departments = DepartmentService.getAll();
      res.json(departments);
    } catch (error) {
      next(error);
    }
  },

  // Consultar un departamento por ID
  getById(req, res, next) {
    try {
      const id = Number(req.params.id);

      const department = DepartmentService.getById(id);

      res.json(department);
    } catch (error) {
      next(error);
    }
  },

  // Consultar departamentos de un país
  getByCountry(req, res, next) {
    try {
      const countryId = Number(req.params.countryId);

      const departments = DepartmentService.getByCountry(
        countryId
      );

      res.json(departments);
    } catch (error) {
      next(error);
    }
  },

  // Crear un departamento
  create(req, res, next) {
    try {
      const department = DepartmentService.create(req.body);

      res.status(201).json(department);
    } catch (error) {
      next(error);
    }
  },

  // Actualizar un departamento
  update(req, res, next) {
    try {
      const id = Number(req.params.id);

      const department = DepartmentService.update(
        id,
        req.body
      );

      res.json(department);
    } catch (error) {
      next(error);
    }
  },

  // Eliminar un departamento
  delete(req, res, next) {
    try {
      const id = Number(req.params.id);

      const result = DepartmentService.delete(id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
