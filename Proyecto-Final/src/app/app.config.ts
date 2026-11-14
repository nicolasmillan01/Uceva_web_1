
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  LOCALE_ID
} from '@angular/core';

import {
  registerLocaleData
} from '@angular/common';

import localeEsCO from '@angular/common/locales/es-CO';

import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

// Registrar configuración regional de Colombia
registerLocaleData(localeEsCO);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({
      eventCoalescing: true
    }),
    provideRouter(routes),
    provideHttpClient(),

    // Configurar español de Colombia
    {
      provide: LOCALE_ID,
      useValue: 'es-CO'
    }
  ]
};
