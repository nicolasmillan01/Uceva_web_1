
import 'dotenv/config';
import { db } from '../src/config/database.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error(
    'Uso: node scripts/create-agent.js correo@example.com'
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
  console.error(
    'No se puede cambiar el rol de un administrador.'
  );
  process.exit(1);
}

if (user.rol === 'agente') {
  console.log('El usuario ya tiene el rol agente.');
  process.exit(0);
}

db.prepare(`
  UPDATE users
  SET rol = 'agente'
  WHERE id = ?
`).run(user.id);

console.log(
  `Rol de agente asignado a ${user.email}`
);

db.close();
