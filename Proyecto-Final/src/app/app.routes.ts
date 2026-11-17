
import { Routes } from '@angular/router';

// AUTENTICACIÓN
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';

// PÁGINAS PRINCIPALES
import { ClientPage } from './pages/client/client.page';
import { AgentPage } from './pages/agent/agent.page';
import { AdminPage } from './pages/admin/admin.page';

// CLIENTES
import { ClientEventsPage } from './pages/client-events/client-events.page';
import { ClientReservationsPage } from './pages/client-reservations/client-reservations.page';
import { ClientCreateReservationPage } from './pages/client-create-reservation/client-create-reservation.page';

// AGENTES
import { AgentEventsPage } from './pages/agent-events/agent-events.page';
import { AgentReservationsPage } from './pages/agent-reservations/agent-reservations.page';
import { AgentCreateEventPage } from './pages/agent-create-event/agent-create-event.page';
import { AgentReportsPage } from './pages/agent-reports/agent-reports.page';

// SEGURIDAD
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [

  // ========================================
  // RUTAS PÚBLICAS
  // ========================================
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'register',
    component: RegisterPage
  },

  // ========================================
  // CLIENTES
  // ========================================
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

  // ========================================
  // AGENTES
  // ========================================
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
        path: 'edit-event/:id',
        component: AgentCreateEventPage
      },
      {
        path: 'reports',
        component: AgentReportsPage
      },
      {
        path: '',
        redirectTo: 'events',
        pathMatch: 'full'
      }
    ]
  },

  // ========================================
  // ADMINISTRADORES
  // ========================================
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
    },
    {
      path: 'reservations',
      loadComponent: () =>
        import('./pages/admin/admin-reservations/admin-reservations')
          .then(m => m.AdminReservations)
    },
    {
      path: 'reports',
      loadComponent: () =>
        import('./pages/admin/admin-reports/admin-reports')
          .then(m => m.AdminReports)
    }
  ]
},

  

  // ========================================
  // REDIRECCIÓN INICIAL
  // ========================================
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // ========================================
  // RUTAS INEXISTENTES
  // ========================================
  {
    path: '**',
    redirectTo: 'login'
  }

];
