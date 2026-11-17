
import { db } from '../config/database.js';

export const AdminReportsController = {

  getReports: (req, res, next) => {
    try {

      // 1. Estadísticas de usuarios
      const users = db.prepare(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN rol = 'cliente' THEN 1 ELSE 0 END) AS clientes,
          SUM(CASE WHEN rol = 'agente' THEN 1 ELSE 0 END) AS agentes,
          SUM(CASE WHEN rol = 'administrador' THEN 1 ELSE 0 END) AS administradores
        FROM users
      `).get();

      // 2. Estadísticas de eventos
      const events = db.prepare(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN estado = 'Programado' THEN 1 ELSE 0 END) AS programados,
          SUM(CASE WHEN estado = 'En Boleteria' THEN 1 ELSE 0 END) AS enBoleteria,
          SUM(CASE WHEN estado = 'En Vivo' THEN 1 ELSE 0 END) AS enVivo,
          SUM(CASE WHEN estado = 'Finalizado' THEN 1 ELSE 0 END) AS finalizados,
          SUM(CASE WHEN estado = 'Cancelado' THEN 1 ELSE 0 END) AS cancelados
        FROM events
      `).get();

      // 3. Estadísticas de reservas
      const reservations = db.prepare(`
        SELECT
          COUNT(*) AS total,

          SUM(CASE
            WHEN estado = 'Pendiente' THEN 1
            ELSE 0
          END) AS pendientes,

          SUM(CASE
            WHEN estado = 'Confirmada' THEN 1
            ELSE 0
          END) AS confirmadas,

          SUM(CASE
            WHEN estado = 'Cancelada' THEN 1
            ELSE 0
          END) AS canceladas,

          SUM(CASE
            WHEN estado IN ('Pendiente', 'Confirmada')
            THEN cantidad
            ELSE 0
          END) AS entradasActivas,

          SUM(CASE
            WHEN estado = 'Pendiente'
            THEN cantidad
            ELSE 0
          END) AS entradasPendientes,

          SUM(CASE
            WHEN estado = 'Confirmada'
            THEN cantidad
            ELSE 0
          END) AS entradasConfirmadas,

          SUM(CASE
            WHEN estado = 'Confirmada'
            THEN total
            ELSE 0
          END) AS ingresosConfirmados

        FROM reservations
      `).get();

      // 4. Eventos con mayor cantidad de reservas
      const topEvents = db.prepare(`
        SELECT
          e.codigo,
          e.nombre,
          e.teatro,
          e.ciudad,
          e.estado,
          e.capacidad,

          COUNT(r.codigo) AS totalReservas,

          COALESCE(SUM(
            CASE
              WHEN r.estado = 'Confirmada'
              THEN r.cantidad
              ELSE 0
            END
          ), 0) AS entradasConfirmadas,

          COALESCE(SUM(
            CASE
              WHEN r.estado = 'Pendiente'
              THEN r.cantidad
              ELSE 0
            END
          ), 0) AS entradasPendientes,

          COALESCE(SUM(
            CASE
              WHEN r.estado = 'Confirmada'
              THEN r.total
              ELSE 0
            END
          ), 0) AS ingresos

        FROM events e

        LEFT JOIN reservations r
          ON r.evento_codigo = e.codigo

        GROUP BY e.codigo

        ORDER BY totalReservas DESC, e.codigo DESC

        LIMIT 10
      `).all();

      // 5. Respuesta general
      res.json({
        usuarios: users,
        eventos: events,
        reservas: reservations,
        eventosMasReservados: topEvents
      });

    } catch (error) {
      next(error);
    }
  }

};
