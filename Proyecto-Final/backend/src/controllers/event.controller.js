
import { EventService } from '../services/event.service.js';

const getId = req => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    throw Object.assign(
      new Error('ID inválido'),
      { status: 400 }
    );
  }

  return id;
};

const isAdmin = req =>
  req.user?.rol === 'administrador';

export const EventController = {

  all: (req, res) => {
    res.json(EventService.all());
  },

  mine: (req, res) => {
    res.json(EventService.mine(req.user.id));
  },

  byId: (req, res) => {
    const result = EventService.byId(getId(req));

    return result
      ? res.json(result)
      : res.status(404).json({
          error: 'Evento no encontrado'
        });
  },

  create: (req, res) => {
    const evento = EventService.create(
      req.body,
      req.user.id
    );

    res.status(201).json(evento);
  },

  update: (req, res) => {
    const id = getId(req);

    const propietario = isAdmin(req)
      ? null
      : req.user.id;

    const result = EventService.update(
      id,
      req.body,
      propietario
    );

    return result
      ? res.json(result)
      : res.status(404).json({
          error: 'Evento no encontrado o no tienes permiso para modificarlo'
        });
  },

  delete: (req, res) => {
    const id = getId(req);

    const propietario = isAdmin(req)
      ? null
      : req.user.id;

    const eliminado = EventService.delete(
      id,
      propietario
    );

    return eliminado
      ? res.status(204).send()
      : res.status(404).json({
          error: 'Evento no encontrado o no tienes permiso para eliminarlo'
        });
  }
};
