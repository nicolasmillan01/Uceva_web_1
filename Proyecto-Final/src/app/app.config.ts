
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
  provideBrowserGlobalErrorListeners,
  LOCALE_ID
} from '@angular/core';

import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';

import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { firstValueFrom, of, catchError } from 'rxjs';

import { routes } from './app.routes';
import { AuthService } from './services/auth.service';
// Registrar español de Colombia
registerLocaleData(localeEsCO);

export const appConfig: ApplicationConfig = {
  providers: [

    provideBrowserGlobalErrorListeners(),

    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    provideRouter(routes),

    provideHttpClient(),

    {
      provide: LOCALE_ID,
      useValue: 'es-CO'
    },

    // Recuperar sesión antes de iniciar Angular
    provideAppInitializer(() => {

      const authService = inject(AuthService);

      if (!authService.getToken()) {
        return Promise.resolve();
      }

      return firstValueFrom(
        authService.restoreSession().pipe(
          catchError(() => of(null))
        )
      ).then(() => undefined);

    })

  ]
};
