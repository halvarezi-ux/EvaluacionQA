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
        // Aunque el backend falle, limpiar sesión local
        console.error('Error al cerrar sesión en backend:', err);
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