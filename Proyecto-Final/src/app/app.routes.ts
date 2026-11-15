
import { Routes } from '@angular/router';

import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';

import { ClientPage } from './pages/client/client.page';
import { AgentPage } from './pages/agent/agent.page';
import { AdminPage } from './pages/admin/admin.page';

import { ClientEventsPage } from './pages/client-events/client-events.page';
import { ClientReservationsPage } from './pages/client-reservations/client-reservations.page';
import { ClientCreateReservationPage } from './pages/client-create-reservation/client-create-reservation.page';

import { AgentEventsPage } from './pages/agent-events/agent-events.page';
import { AgentReservationsPage } from './pages/agent-reservations/agent-reservations.page';
import { AgentCreateEventPage } from './pages/agent-create-event/agent-create-event.page';

import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [

  // RUTAS PÚBLICAS
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'register',
    component: RegisterPage
  },

  // RUTAS DEL CLIENTE
  {
    path: 'client',
    component: ClientPage,
    canActivate: [
      authGuard,
      roleGuard(['cliente'])
    ],
    canActivateChild: [
      authGuard,
      roleGuard(['cliente'])
    ],
    children: [
      {
        path: 'events',
        component: ClientEventsPage
      },
      {
        path: 'reservations',
        component: ClientReservationsPage
      },
      {
        path: 'create-reservation/:id',
        component: ClientCreateReservationPage
      },
      {
        path: '',
        redirectTo: 'events',
        pathMatch: 'full'
      }
    ]
  },

  // RUTAS DEL AGENTE
  {
    path: 'agent',
    component: AgentPage,
    canActivate: [
      authGuard,
      roleGuard(['agente'])
    ],
    canActivateChild: [
      authGuard,
      roleGuard(['agente'])
    ],
    children: [
      {
        path: 'events',
        component: AgentEventsPage
      },
      {
        path: 'reservations',
        component: AgentReservationsPage
      },
      {
        path: 'create-event',
        component: AgentCreateEventPage
      },
      {
        path: '',
        redirectTo: 'events',
        pathMatch: 'full'
      }
    ]
  },

  // RUTA DEL ADMINISTRADOR

{
  path: 'admin',
  canActivate: [
    authGuard,
    roleGuard(['administrador'])
  ],
  canActivateChild: [
    authGuard,
    roleGuard(['administrador'])
  ],
  children: [
    {
      path: '',
      component: AdminPage
    },
    {
      path: 'users',
      loadComponent: () =>
        import('./pages/admin/users/admin-users/admin-users')
          .then(m => m.AdminUsers)
    }
  ]
},


  // REDIRECCIÓN INICIAL
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // RUTAS INEXISTENTES
  {
    path: '**',
    redirectTo: 'login'
  }

];
