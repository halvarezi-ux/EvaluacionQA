import { Routes } from '@angular/router';
import { LoginComponent }        from './auth/login/login.component';
import { LogoutComponent }       from './auth/logout/logout.component';
import { ForbiddenComponent }    from './shared/pages/forbidden/forbidden.component';
import { LayoutComponent }       from './shared/layout/layout.component';
import { authGuard }             from './auth/auth.guard';
import { roleGuard }             from './auth/role.guard';
import { UserListComponent }     from './usuarios/user-list/user-list.component';
import { UserFormComponent }     from './usuarios/user-form/user-form.component';
import { BoletaListComponent }   from './boletas/boleta-list/boleta-list.component';
import { BoletaFormComponent }   from './boletas/boleta-form/boleta-form.component';
import { BoletaEstructuraComponent } from './boletas/boleta-estructura/boleta-estructura.component';
import { EvaluacionListComponent }   from './evaluaciones/evaluacion-list/evaluacion-list.component';
import { EvaluacionNuevaComponent }  from './evaluaciones/evaluacion-nueva/evaluacion-nueva.component';
import { EvaluacionDetalleComponent } from './evaluaciones/evaluacion-detalle/evaluacion-detalle.component';

export const routes: Routes = [
  // ── Public ──────────────────────────────────────────
  { path: 'login',  component: LoginComponent },
  { path: 'logout', component: LogoutComponent, canActivate: [authGuard] },
  { path: '403',    component: ForbiddenComponent },

  // ── Authenticated — inside global Layout ──────────
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // Default redirect
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },

      // Admin — Usuarios
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { role: 'Admin' },
        loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
        children: [
          { path: '',              redirectTo: 'usuarios', pathMatch: 'full' },
          { path: 'usuarios',          component: UserListComponent, canActivate: [roleGuard], data: { role: 'Admin' } },
          { path: 'usuarios/new',      component: UserFormComponent, canActivate: [roleGuard], data: { role: 'Admin' } },
          { path: 'usuarios/edit/:id', component: UserFormComponent, canActivate: [roleGuard], data: { role: 'Admin' } },
        ],
      },

      // QA placeholder
      {
        path: 'qa',
        canActivate: [roleGuard],
        data: { role: 'QA' },
        loadComponent: () => import('./qa/qa.component').then(m => m.QAComponent),
      },

      // Analista placeholder
      {
        path: 'analista',
        canActivate: [roleGuard],
        data: { role: 'Analista' },
        loadComponent: () => import('./analista/analista.component').then(m => m.AnalistaComponent),
      },

      // Boletas
      { path: 'boletas',                  component: BoletaListComponent,      canActivate: [roleGuard], data: { roles: ['Admin', 'QA Lead'] } },
      { path: 'boletas/nueva',            component: BoletaFormComponent,      canActivate: [roleGuard], data: { roles: ['Admin', 'QA Lead'] } },
      { path: 'boletas/editar/:id',       component: BoletaFormComponent,      canActivate: [roleGuard], data: { roles: ['Admin', 'QA Lead'] } },
      { path: 'boletas/:id/estructura',   component: BoletaEstructuraComponent,canActivate: [roleGuard], data: { roles: ['Admin', 'QA Lead'] } },

      // Evaluaciones
      { path: 'evaluaciones',             component: EvaluacionListComponent,  canActivate: [roleGuard], data: { roles: ['Admin', 'QA Lead', 'QA'] } },
      { path: 'evaluaciones/nueva',       component: EvaluacionNuevaComponent, canActivate: [roleGuard], data: { roles: ['Admin', 'QA Lead', 'QA'] } },
      { path: 'evaluaciones/:id',         component: EvaluacionDetalleComponent,canActivate: [roleGuard],data: { roles: ['Admin', 'QA Lead', 'QA'] } },
    ],
  },

  // Wildcard
  { path: '**', redirectTo: 'login' },
];