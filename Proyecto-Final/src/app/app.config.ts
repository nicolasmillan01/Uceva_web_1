
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom, of, catchError } from 'rxjs';

import { routes } from './app.routes';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [

    // Configuración de detección de cambios
    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    // Configuración de las rutas Angular
    provideRouter(routes),

    // Comunicación HTTP con Node.js
    provideHttpClient(),

    // Recuperar sesión al iniciar Angular
    provideAppInitializer(() => {

      const authService = inject(AuthService);

      // Si no existe token, continuar normalmente
      if (!authService.getToken()) {
        return Promise.resolve();
      }

      // Validar el token y recuperar el usuario
      return firstValueFrom(
        authService.restoreSession().pipe(

          // Si el token es inválido, continuar sin sesión
          catchError(() => of(null))

        )
      ).then(() => undefined);

    })

  ]
};
