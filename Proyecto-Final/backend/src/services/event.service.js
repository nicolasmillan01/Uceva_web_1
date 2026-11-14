import { EventModel } from '../models/event.model.js';
const validStates = ['Programado','En Boleteria','En Vivo','Finalizado','Cancelado'];
export function validateEvent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Object.assign(new Error('Se requiere un objeto JSON'),{status:400});
  for (const k of ['nombre','teatro','ciudad','fecha_inicio','fecha_fin']) {
    if (typeof input[k] !== 'string' || !input[k].trim()) throw Object.assign(new Error(`Campo inválido: ${k}`),{status:400});
  }
  const capacidad = Number(input.capacidad), precio = Number(input.precio);
  if (!Number.isInteger(capacidad) || capacidad < 1 || !Number.isFinite(precio) || precio < 0) throw Object.assign(new Error('Capacidad o precio inválido'),{status:400});
  const start = Date.parse(input.fecha_inicio), end = Date.parse(input.fecha_fin);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw Object.assign(new Error('El rango de fechas es inválido'),{status:400});
  const estado = input.estado ?? 'Programado';
  if (!validStates.includes(estado)) throw Object.assign(new Error('Estado inválido'),{status:400});
  return { nombre:input.nombre.trim(), descripcion:String(input.descripcion ?? ''), teatro:input.teatro.trim(), ciudad:input.ciudad.trim(), fecha_inicio: new Date(start).toISOString(), fecha_fin:new Date(end).toISOString(), capacidad,precio,observaciones:String(input.observaciones ?? ''),estado };
}
export const EventService = {
  all: () => EventModel.findAll(),
  byId: id => EventModel.findById(id),
  create: input => EventModel.create(validateEvent(input)),
  update: (id,input) => EventModel.update(id,validateEvent(input)),
  delete: id => EventModel.delete(id)
};
