
import { CityService } from '../services/city.service.js';

export const CityController = {

  // Consultar todas las ciudades
  getAll(req, res, next) {
    try {
      const cities = CityService.getAll();

      res.json(cities);
    } catch (error) {
      next(error);
    }
  },

  // Consultar una ciudad por ID
  getById(req, res, next) {
    try {
      const id = Number(req.params.id);

      const city = CityService.getById(id);

      res.json(city);
    } catch (error) {
      next(error);
    }
  },

  // Consultar ciudades de un departamento
  getByDepartment(req, res, next) {
    try {
      const departmentId = Number(
        req.params.departmentId
      );

      const cities = CityService.getByDepartment(
        departmentId
      );

      res.json(cities);
    } catch (error) {
      next(error);
    }
  },

  // Registrar una ciudad
  create(req, res, next) {
    try {
      const city = CityService.create(req.body);

      res.status(201).json(city);
    } catch (error) {
      next(error);
    }
  },

  // Actualizar una ciudad
  update(req, res, next) {
    try {
      const id = Number(req.params.id);

      const city = CityService.update(
        id,
        req.body
      );

      res.json(city);
    } catch (error) {
      next(error);
    }
  },

  // Eliminar una ciudad
  delete(req, res, next) {
    try {
      const id = Number(req.params.id);

      const result = CityService.delete(id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
