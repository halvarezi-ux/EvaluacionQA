import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { LogoutComponent } from './auth/logout/logout.component';
import { UserListComponent } from './usuarios/user-list/user-list.component';
import { UserFormComponent } from './usuarios/user-form/user-form.component';
import { ForbiddenComponent } from './shared/pages/forbidden/forbidden.component';
import { BoletaListComponent } from './boletas/boleta-list/boleta-list.component';
import { BoletaFormComponent } from './boletas/boleta-form/boleta-form.component';
import { EvaluacionListComponent }    from './evaluaciones/evaluacion-list/evaluacion-list.component';
import { EvaluacionNuevaComponent }   from './evaluaciones/evaluacion-nueva/evaluacion-nueva.component';
import { EvaluacionDetalleComponent } from './evaluaciones/evaluacion-detalle/evaluacion-detalle.component';
import { BoletaEstructuraComponent } from './boletas/boleta-estructura/boleta-estructura.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent, canActivate: [authGuard] },
  { path: '403', component: ForbiddenComponent },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' },
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
    children: [
      {
        path: 'usuarios',
        component: UserListComponent,
        canActivate: [authGuard, roleGuard],
        data: { role: 'Admin' }
      },
      {
        path: 'usuarios/new',
        component: UserFormComponent,
        canActivate: [authGuard, roleGuard],
        data: { role: 'Admin' }
      },
      {
        path: 'usuarios/edit/:id',
        component: UserFormComponent,
        canActivate: [authGuard, roleGuard],
        data: { role: 'Admin' }
      }
    ]
  },
  {
    path: 'qa',
    canActivate: [authGuard, roleGuard],
    data: { role: 'QA' },
    loadComponent: () => import('./qa/qa.component').then(m => m.QAComponent)
  },
  {
    path: 'analista',
    canActivate: [authGuard, roleGuard],
    data: { role: 'Analista' },
    loadComponent: () => import('./analista/analista.component').then(m => m.AnalistaComponent)
  },
  // Boletas — Admin y QA Lead
  {
    path: 'boletas',
    component: BoletaListComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'QA Lead'] }
  },
  {
    path: 'boletas/nueva',
    component: BoletaFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'QA Lead'] }
  },
  {
    path: 'boletas/editar/:id',
    component: BoletaFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'QA Lead'] }
  },
  {
    path: 'boletas/:id/estructura',
    component: BoletaEstructuraComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'QA Lead'] }
  },
  // Evaluaciones — Admin, QA Lead y QA
  {
    path: 'evaluaciones',
    component: EvaluacionListComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'QA Lead', 'QA'] }
  },
  {
    path: 'evaluaciones/nueva',
    component: EvaluacionNuevaComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'QA Lead', 'QA'] }
  },
  {
    path: 'evaluaciones/:id',
    component: EvaluacionDetalleComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin', 'QA Lead', 'QA'] }
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];