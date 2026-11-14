import type { DatabaseSync } from 'node:sqlite';

export function createReservationsTable(
  db: DatabaseSync
): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      codigo INTEGER PRIMARY KEY AUTOINCREMENT,

      usuario_id INTEGER NOT NULL,
      evento_codigo INTEGER NOT NULL,

      cantidad INTEGER NOT NULL
        CHECK (cantidad > 0),

      total REAL NOT NULL
        CHECK (total >= 0),

      estado TEXT NOT NULL DEFAULT 'Confirmada'
        CHECK (
          estado IN ('Pendiente', 'Confirmada', 'Cancelada')
        ),

      fecha_reserva TEXT NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (usuario_id)
        REFERENCES users(id),

      FOREIGN KEY (evento_codigo)
        REFERENCES events(codigo)
    );

    CREATE INDEX IF NOT EXISTS
      idx_reservations_user
    ON reservations(usuario_id);

    CREATE INDEX IF NOT EXISTS
      idx_reservations_event
    ON reservations(evento_codigo);
  `);
}
