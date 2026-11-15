
import 'dotenv/config';
import { db } from '../src/config/database.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error(
    'Uso: node scripts/create-admin.js correo@example.com'
  );
  process.exit(1);
}

const user = db.prepare(`
  SELECT id, nombre, email, rol
  FROM users
  WHERE email = ?
`).get(email);

if (!user) {
  console.error('El usuario no existe.');
  process.exit(1);
}

if (user.rol === 'administrador') {
  console.log('El usuario ya es administrador.');
  process.exit(0);
}

db.prepare(`
  UPDATE users
  SET rol = 'administrador'
  WHERE id = ?
`).run(user.id);

console.log(
  `Rol de administrador asignado a ${user.email}`
);
