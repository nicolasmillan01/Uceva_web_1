
import {
  Component,
  inject
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { AuthService } from '../../services/auth.service';

interface NavbarConfig {
  url: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  // SERVICIOS
  public authService = inject(AuthService);
  private router = inject(Router);

  // NAVEGACIÓN DEL CLIENTE
  clientConfig: NavbarConfig[] = [
    {
      url: '/client/events',
      label: 'Eventos',
      icon: 'calendar-event'
    },
    {
      url: '/client/reservations',
      label: 'Reservaciones',
      icon: 'ticket-perforated'
    }
  ];

  // NAVEGACIÓN DEL AGENTE
  agentConfig: NavbarConfig[] = [
    {
      url: '/agent/events',
      label: 'Eventos',
      icon: 'calendar3'
    },
    {
      url: '/agent/create-event',
      label: 'Crear Evento',
      icon: 'calendar-plus'
    },
    {
      url: '/agent/reservations',
      label: 'Reservaciones',
      icon: 'ticket-perforated'
    },
    {
      url: '/agent/reports',
      label: 'Reportes',
      icon: 'bar-chart-line'
    }
  ];

  // NAVEGACIÓN DEL ADMINISTRADOR

  // NAVEGACIÓN DEL ADMINISTRADOR
  adminConfig: NavbarConfig[] = [
    {
      url: '/admin/users',
      label: 'Usuarios',
      icon: 'people'
    },
    {
      url: '/admin/reservations',
      label: 'Reservas',
      icon: 'ticket-perforated'
    },
    {
      url: '/admin/reports',
      label: 'Reportes',
      icon: 'bar-chart-line'
    }
  ];


  // OPCIONES SEGÚN EL ROL
  navbarConfig: NavbarConfig[] = [];

  constructor() {
    this.setNavbarConfig();
  }

  // CONFIGURAR MENÚ SEGÚN EL ROL
  setNavbarConfig(): void {

    const role = this.authService.currentUser()?.rol;

    switch (role) {

      case 'cliente':
        this.navbarConfig = this.clientConfig;
        break;

      case 'agente':
        this.navbarConfig = this.agentConfig;
        break;

      case 'administrador':
        this.navbarConfig = this.adminConfig;
        break;

      default:
        this.navbarConfig = [];
        break;
    }
  }

  // INICIALES DEL USUARIO
  get userInitials(): string {

    const nombre = this.authService.currentUser()?.nombre;

    if (!nombre) {
      return 'US';
    }

    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(
        palabra => palabra.charAt(0).toUpperCase()
      )
      .join('');
  }

  // NOMBRE DEL USUARIO
  get userName(): string {
    return this.authService.currentUser()?.nombre
      || 'Usuario';
  }

  // ROL DEL USUARIO
  get userRole(): string {

    const role = this.authService.currentUser()?.rol;

    switch (role) {

      case 'cliente':
        return 'Cliente';

      case 'agente':
        return 'Agente';

      case 'administrador':
        return 'Administrador';

      default:
        return '';
    }
  }

  // CERRAR SESIÓN
  logout(): void {

    this.authService.logout();

    this.router.navigateByUrl('/login');
  }
}
