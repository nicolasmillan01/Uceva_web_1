
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

  
private getId(value: string | string[] | undefined): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
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

  all = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const usuario = this.getUser(req);

      if (usuario.rol !== 'administrador') {
        return next(Object.assign(
          new Error('Acceso denegado'),
          { status: 403 }
        ));
      }

      res.json(this.service.getAll());
    } catch (error) {
      next(error);
    }
  };

  byId = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const codigo = this.getId(req.params.id);
      const usuario = this.getUser(req);
      const reserva = this.service.getById(codigo);

      if (
        usuario.rol !== 'administrador' &&
        reserva.usuario_id !== usuario.id
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

  byUser = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const usuario = this.getUser(req);

      res.json(
        this.service.getByUser(usuario.id)
      );
    } catch (error) {
      next(error);
    }
  };

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

      const eventoCodigo = Number(req.body?.evento_codigo);
      const cantidad = Number(req.body?.cantidad);

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

      if (!esAdministrador && !esPropietario) {
        throw Object.assign(
          new Error('Acceso denegado'),
          { status: 403 }
        );
      }

      if (!esAdministrador) {
        if (
          usuario.rol !== 'cliente' ||
          req.body?.estado !== 'Cancelada' ||
          req.body?.cantidad !== reserva.cantidad
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