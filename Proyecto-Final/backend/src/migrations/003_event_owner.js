
export function createEventOwnerColumn(db) {
  const columns = db.prepare(`
    PRAGMA table_info(events)
  `).all();

  const exists = columns.some(
    column => column.name === 'creado_por'
  );

  if (!exists) {
    db.exec(`
      ALTER TABLE events
      ADD COLUMN creado_por INTEGER
      REFERENCES users(id) ON DELETE SET NULL
    `);
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_events_creado_por
    ON events(creado_por)
  `);
}
