import { EventService } from '../services/event.service.js';
const getId = req => { const id = Number(req.params.id); if (!Number.isSafeInteger(id) || id < 1) throw Object.assign(new Error('ID inválido'),{status:400}); return id; };
export const EventController = {
  all: (req,res) => res.json(EventService.all()),
  byId: (req,res) => { const result=EventService.byId(getId(req)); return result ? res.json(result) : res.status(404).json({error:'Evento no encontrado'}); },
  create: (req,res) => res.status(201).json(EventService.create(req.body)),
  update: (req,res) => { const result=EventService.update(getId(req),req.body); return result ? res.json(result) : res.status(404).json({error:'Evento no encontrado'}); },
  delete: (req,res) => EventService.delete(getId(req)) ? res.status(204).send() : res.status(404).json({error:'Evento no encontrado'})
};
