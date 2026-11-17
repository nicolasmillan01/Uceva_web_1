
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import './config/database.js';

import eventRoutes from './routes/event.routes.js';
import countryRoutes from './routes/country.routes.js';

import departmentRoutes from './routes/department.routes.js';
import cityRoutes from './routes/city.routes.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

import { authenticate } from './middlewares/auth.middleware.js';

import { createReservationRoutes } from '../dist/routes/reservation.routes.js';

import { db } from './config/database.js';

import adminReportsRoutes from './routes/admin-reports.routes.js';

const app = express();

// Permitir conexiones desde Angular
app.use(cors({
  origin: 'http://localhost:4200'
}));

// Permitir recibir información JSON
app.use(express.json({ limit: '100kb' }));

// Comprobar que el servidor funciona
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rutas de eventos
app.use('/api/events', eventRoutes);

// Rutas de países
app.use('/api/countries', countryRoutes);

// Rutas de departamentos
app.use('/api/departments', departmentRoutes);

// RUtas de ciudades
app.use('/api/cities', cityRoutes);

// Rutas de autenticacion
app.use('/api/auth', authRoutes);

// Rutas de administración de usuarios
app.use('/api/users', userRoutes);

// Reportes generales del administrador
app.use('/api/admin/reports', adminReportsRoutes);

// Reservas: requieren autenticación JWT
app.use(
  '/api/reservations',
  authenticate,
  createReservationRoutes(db)
);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
});

// Manejo general de errores
app.use((err, req, res, next) => {
  console.error(err);

  const status = err.status ||
    (err instanceof SyntaxError ? 400 : 500);

  res.status(status).json({
    error: status >= 500
      ? 'Error interno del servidor'
      : err.message
  });
});

// Iniciar servidor
app.listen(3000, () => {
  console.log(
    'API disponible en http://localhost:3000'
  );
});
