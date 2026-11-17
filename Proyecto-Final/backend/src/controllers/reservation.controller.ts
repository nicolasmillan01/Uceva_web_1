
import type { Request, Response, NextFunction } from 'express';
import type { DatabaseSync } from 'node:sqlite';

import { ReservationService } from '../services/reservation.service.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    rol: 'cliente' | 'agente' | 'administrador';
  };
}

export class ReservationController {
  private readonly service: ReservationService;

  constructor(db: DatabaseSync) {
    this.service = new ReservationService(db);
  }

  // Validar identificadores.
  private getId(
    value: string | string[] | undefined
  ): number {
    if (
      typeof value !== 'string' ||
      !/^[1-9]\d*$/.test(value)
    ) {
      throw Object.assign(
        new Error('Identificador inválido'),
        { status: 400 }
      );
    }

    const id = Number(value);

    if (!Number.isSafeInteger(id)) {
      throw Object.assign(
        new Error('Identificador inválido'),
        { status: 400 }
      );
    }

    return id;
  }

  // Obtener usuario autenticado.
  private getUser(req: AuthenticatedRequest): {
    id: number;
    rol: string;
  } {
    if (!req.user) {
      throw Object.assign(
        new Error('No autenticado'),
        { status: 401 }
      );
    }

    return req.user;
  }

  // Consultar todas las reservas: administrador.
  all = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const usuario = this.getUser(req);

      if (usuario.rol !== 'administrador') {
        throw Object.assign(
          new Error('Acceso denegado'),
          { status: 403 }
        );
      }

      res.json(this.service.getAll());
    } catch (error) {
      next(error);
    }
  };

  // Consultar una reserva.
  byId = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const codigo = this.getId(req.params.id);
      const usuario = this.getUser(req);
      const reserva = this.service.getById(codigo);

      const esAdministrador =
        usuario.rol === 'administrador';

      const esPropietario =
        reserva.usuario_id === usuario.id;

      const esAgentePropietario =
        usuario.rol === 'agente' &&
        this.service.agentOwnsReservation(
          codigo,
          usuario.id
        );

      if (
        !esAdministrador &&
        !esPropietario &&
        !esAgentePropietario
      ) {
        throw Object.assign(
          new Error('Acceso denegado'),
          { status: 403 }
        );
      }

      res.json(reserva);
    } catch (error) {
      next(error);
    }
  };

  // Consultar reservas del cliente autenticado.
  byUser = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const usuario = this.getUser(req);

      if (usuario.rol !== 'cliente') {
        throw Object.assign(
          new Error('Acceso exclusivo para clientes'),
          { status: 403 }
        );
      }

      res.json(
        this.service.getByUser(usuario.id)
      );
    } catch (error) {
      next(error);
    }
  };

  // Consultar reservas de todos los eventos del agente.
  byAgent = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const usuario = this.getUser(req);

      if (usuario.rol !== 'agente') {
        throw Object.assign(
          new Error('Solo los agentes pueden consultar estas reservas'),
          { status: 403 }
        );
      }

      res.json(
        this.service.getByAgent(usuario.id)
      );
    } catch (error) {
      next(error);
    }
  };

  // Consultar reservas de un evento propio del agente.
  byAgentEvent = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const usuario = this.getUser(req);

      if (usuario.rol !== 'agente') {
        throw Object.assign(
          new Error('Acceso exclusivo para agentes'),
          { status: 403 }
        );
      }

      const eventoCodigo = this.getId(
        req.params.eventoCodigo
      );

      const pertenece =
        this.service.isEventOwnedByAgent(
          usuario.id,
          eventoCodigo
        );

      if (!pertenece) {
        throw Object.assign(
          new Error('No tienes permiso para consultar este evento'),
          { status: 403 }
        );
      }

      res.json(
        this.service.getByEvent(eventoCodigo)
      );
    } catch (error) {
      next(error);
    }
  };

  // Crear reserva: solamente clientes.
  create = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const usuario = this.getUser(req);

      if (usuario.rol !== 'cliente') {
        throw Object.assign(
          new Error('Solo los clientes pueden reservar'),
          { status: 403 }
        );
      }

      const eventoCodigo = Number(
        req.body?.evento_codigo
      );

      const cantidad = Number(
        req.body?.cantidad
      );

      const reserva = this.service.create(
        usuario.id,
        eventoCodigo,
        cantidad
      );

      res.status(201).json(reserva);
    } catch (error) {
      next(error);
    }
  };

  // Actualizar reserva según permisos.
  update = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const usuario = this.getUser(req);
      const codigo = this.getId(req.params.id);
      const reserva = this.service.getById(codigo);

      const esAdministrador =
        usuario.rol === 'administrador';

      const esPropietario =
        reserva.usuario_id === usuario.id;

      const esAgentePropietario =
        usuario.rol === 'agente' &&
        this.service.agentOwnsReservation(
          codigo,
          usuario.id
        );

      if (
        !esAdministrador &&
        !esPropietario &&
        !esAgentePropietario
      ) {
        throw Object.assign(
          new Error('Acceso denegado'),
          { status: 403 }
        );
      }

      // Permisos del agente.
      if (esAgentePropietario) {
        const estado = req.body?.estado;

        if (
          reserva.estado !== 'Pendiente' ||
          !['Confirmada', 'Cancelada'].includes(estado) ||
          Number(req.body?.cantidad) !== reserva.cantidad
        ) {
          throw Object.assign(
            new Error('La operación solicitada no es válida'),
            { status: 400 }
          );
        }

        res.json(
          this.service.update(
            codigo,
            reserva.cantidad,
            estado
          )
        );

        return;
      }

      // Permisos del cliente.
      if (!esAdministrador) {
        if (
          usuario.rol !== 'cliente' ||
          req.body?.estado !== 'Cancelada' ||
          Number(req.body?.cantidad) !== reserva.cantidad
        ) {
          throw Object.assign(
            new Error(
              'El cliente solo puede cancelar su propia reserva'
            ),
            { status: 403 }
          );
        }

        if (reserva.estado === 'Cancelada') {
          throw Object.assign(
            new Error('La reserva ya está cancelada'),
            { status: 409 }
          );
        }

        res.json(
          this.service.update(
            codigo,
            reserva.cantidad,
            'Cancelada'
          )
        );

        return;
      }

      // Permisos del administrador.
      const cantidad = Number(req.body?.cantidad);
      const estado = req.body?.estado;

      res.json(
        this.service.update(
          codigo,
          cantidad,
          estado
        )
      );

    } catch (error) {
      next(error);
    }
  };

  // Eliminar reserva: solamente administrador.
  delete = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const usuario = this.getUser(req);
      const codigo = this.getId(req.params.id);

      if (usuario.rol !== 'administrador') {
        throw Object.assign(
          new Error(
            'Solo el administrador puede eliminar reservas'
          ),
          { status: 403 }
        );
      }

      this.service.delete(codigo);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
