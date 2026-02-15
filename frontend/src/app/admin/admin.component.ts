import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>Panel de Administración</mat-card-title>
          <div class="spacer"></div>
          <button mat-raised-button color="warn" (click)="logout()" class="logout-btn">
            <mat-icon>logout</mat-icon>
            Cerrar Sesión
          </button>
        </mat-card-header>
      </mat-card>
      
      <mat-card class="content-card">
        <mat-card-content>
          <h2>¡Bienvenido, Administrador!</h2>
          <p>Desde aquí podrás gestionar usuarios, roles y configuraciones del sistema.</p>
          <p><strong>Rol:</strong> Admin</p>
        </mat-card-content>
      </mat-card>

    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header-card {
      margin-bottom: 20px;
    }
    mat-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
    }
    .spacer {
      flex: 1;
    }
    .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .content-card {
      padding: 20px;
    }
  `]
})
export class AdminComponent {
  constructor(private router: Router) {}
  
  logout(): void {
    this.router.navigate(['/logout']);
  }
}