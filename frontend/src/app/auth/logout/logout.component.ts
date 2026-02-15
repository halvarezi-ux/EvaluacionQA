import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { TokenService } from '../token.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  template: `<p>Cerrando sesión...</p>`,  // ← Template inline
  styleUrl: './logout.component.scss'
})
export class LogoutComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.performLogout();
  }

  /**
   * Ejecuta el logout completo:
   * 1. Invalida token en backend
   * 2. Limpia localStorage
   * 3. Redirige a login
   */
  private performLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Backend confirmó logout exitoso
        this.clearSessionAndRedirect();
      },
      error: (err) => {
        // Error 401 es normal: token ya invalidado o expirado
        if (err.status === 401) {
          console.info('ℹ️ Token ya invalidado o expirado (comportamiento esperado)');
        } else {
          console.warn('⚠️ No se pudo notificar logout al backend:', err.message);
        }
        // Siempre limpiar sesión local aunque el backend falle
        this.clearSessionAndRedirect();
      }
    });
  }

  /**
   * Limpia la sesión local y redirige al login
   */
  private clearSessionAndRedirect(): void {
    this.tokenService.removeToken();
    this.tokenService.removeUser();
    this.router.navigate(['/login']);
  }
}