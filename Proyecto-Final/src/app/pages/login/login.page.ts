
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login.page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {

  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  loading = signal(false);
  errorMessage = signal('');

  login(): void {
    this.errorMessage.set('');

    if (!this.email.trim() || !this.password) {
      this.errorMessage.set(
        'Debes ingresar tu correo y contraseña'
      );
      return;
    }

    this.loading.set(true);

    this.authService.login(
      this.email,
      this.password
    ).subscribe({
      next: (response) => {
        this.loading.set(false);

        switch (response.usuario.rol) {
          case 'administrador':
            this.router.navigateByUrl('/admin');
            break;

          case 'agente':
            this.router.navigateByUrl('/agent/events');
            break;

          case 'cliente':
            this.router.navigateByUrl('/client/events');
            break;

          default:
            this.authService.logout();
            this.errorMessage.set(
              'El usuario no tiene un rol válido'
            );
        }
      },

      error: (error) => {
        this.loading.set(false);

        if (error.status === 401) {
          this.errorMessage.set(
            'Correo o contraseña incorrectos'
          );
        } else if (error.status === 0) {
          this.errorMessage.set(
            'No se pudo conectar con el servidor'
          );
        } else {
          this.errorMessage.set(
            'Ocurrió un error al iniciar sesión'
          );
        }
      }
    });
  }
}
