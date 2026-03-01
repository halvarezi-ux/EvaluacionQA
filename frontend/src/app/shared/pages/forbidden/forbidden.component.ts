import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TokenService } from '../../../auth/token.service';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './forbidden.component.html',
  styleUrls: ['./forbidden.component.css']
})
export class ForbiddenComponent {

  // Mismo mapa de roles que LoginComponent — centralizar en un servicio es el siguiente paso
  private readonly dashboardByRole: Record<string, string> = {
    'Admin':    '/admin',
    'QA Lead':  '/boletas',
    'QA':       '/evaluaciones',
    'Analista': '/analista',
    'Asesor':   '/dashboard',
  };

  constructor(
    private router: Router,
    private tokenService: TokenService,
  ) {}

  goToDashboard(): void {
    const user = this.tokenService.getUser();
    const role = user?.role?.nombre ?? '';
    this.router.navigate([this.dashboardByRole[role] ?? '/login']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
