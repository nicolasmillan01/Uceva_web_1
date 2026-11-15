
import {
  Component,
  inject,
  computed
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
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {

  // Servicios
  public authService = inject(AuthService);
  private router = inject(Router);

  // Navegación del cliente
  clientConfig: NavbarConfig[] = [
    {
      url: '/client/events',
      label: 'Eventos',
      icon: 'calendar3'
    },
    {
      url: '/client/reservations',
      label: 'Reservaciones',
      icon: 'calendar3'
    }
  ];

  // Navegación del agente
  agentConfig: NavbarConfig[] = [
    {
      url: '/agent/events',
      label: 'Eventos',
      icon: 'calendar3'
    },
    {
      url: '/agent/create-event',
      label: 'Crear Evento',
      icon: 'calendar3'
    }
  ];

  // Navegación según el rol autenticado
  navbarConfig: NavbarConfig[] = [];

  constructor() {
    this.setNavbarConfig();
  }

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
        this.navbarConfig = [];
        break;

      default:
        this.navbarConfig = [];
    }
  }

  // Iniciales del usuario
  get userInitials(): string {
    const nombre = this.authService.currentUser()?.nombre;

    if (!nombre) {
      return 'US';
    }

    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(palabra => palabra.charAt(0).toUpperCase())
      .join('');
  }

  // Nombre del usuario
  get userName(): string {
    return this.authService.currentUser()?.nombre || 'Usuario';
  }

  // Rol del usuario
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

  // Cerrar sesión
  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
