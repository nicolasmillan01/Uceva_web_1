import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface NavbarConfig {
  url: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {

  navbarConfig: NavbarConfig[] = [];

 clientConfig: NavbarConfig[] = [
  { url: '/client/events', label: 'Eventos', icon: 'calendar-event' },
  { url: '/client/reservations', label: 'Reservaciones', icon: 'ticket-perforated' },
];

 agentConfig: NavbarConfig[] = [
  { url: '/agent/events', label: 'Eventos', icon: 'calendar3' },
  { url: '/agent/create-event', label: 'Crear Evento', icon: 'calendar-plus' },
  { url: '/agent/reports', label: 'Reportes', icon: 'bar-chart-line' },
];

  private router = inject(Router);

  constructor(){
    this.setNavbarConfig();
  }

  setNavbarConfig(){
    switch(this.getRole()){
      case 'client':
        this.navbarConfig = this.clientConfig;
        break;
      case 'agent':
        this.navbarConfig = this.agentConfig;
        break;
    }
  }

  getRole(): 'client' | 'agent' | 'admin' {

    const url = this.router.url;

    if (url.includes('/client')) {
      return 'client';
    }

    if (url.includes('/agent')) {
      return 'agent';
    }

    if (url.includes('/admin')) {
      return 'admin';
    }

    return 'client';
  }

}
