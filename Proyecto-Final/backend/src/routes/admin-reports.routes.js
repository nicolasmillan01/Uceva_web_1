
import { Router } from 'express';

import {
  authenticate,
  authorize
} from '../middlewares/auth.middleware.js';

import {
  AdminReportsController
} from '../controllers/admin-reports.controller.js';

const router = Router();

// Reportes exclusivos del administrador.
router.get(
  '/',
  authenticate,
  authorize('administrador'),
  AdminReportsController.getReports
);

export default router;
