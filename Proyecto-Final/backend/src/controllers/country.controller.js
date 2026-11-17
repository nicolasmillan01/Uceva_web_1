
import { CountryService } from '../services/country.service.js';

export const CountryController = {

  // Consultar todos los países
  getAll(req, res, next) {
    try {
      const countries = CountryService.getAll();
      res.json(countries);
    } catch (error) {
      next(error);
    }
  },

  // Consultar un país por ID
  getById(req, res, next) {
    try {
      const country = CountryService.getById(
        Number(req.params.id)
      );

      res.json(country);
    } catch (error) {
      next(error);
    }
  },

  // Registrar un país
  create(req, res, next) {
    try {
      const country = CountryService.create(req.body);

      res.status(201).json(country);
    } catch (error) {
      next(error);
    }
  },

  // Actualizar un país
  update(req, res, next) {
    try {
      const country = CountryService.update(
        Number(req.params.id),
        req.body
      );

      res.json(country);
    } catch (error) {
      next(error);
    }
  },

  // Eliminar un país
  delete(req, res, next) {
    try {
      const result = CountryService.delete(
        Number(req.params.id)
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
