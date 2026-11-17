
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  AuthService,
  AuthUser
} from '../services/auth.service';

export const roleGuard = (
  allowedRoles: AuthUser['rol'][]
): CanActivateFn => {

  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();

    if (!user) {
      return router.createUrlTree(['/login']);
    }

    if (allowedRoles.includes(user.rol)) {
      return true;
    }

    // Redirigir según el rol real del usuario
    switch (user.rol) {
      case 'administrador':
        return router.createUrlTree(['/admin']);

      case 'agente':
        return router.createUrlTree(['/agent/events']);

      case 'cliente':
        return router.createUrlTree(['/client/events']);
    }
  };
};
