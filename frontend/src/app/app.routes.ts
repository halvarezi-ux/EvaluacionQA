import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { LogoutComponent } from './auth/logout/logout.component';
import { UserListComponent } from './usuarios/user-list/user-list.component';
import { UserFormComponent } from './usuarios/user-form/user-form.component';
import { ForbiddenComponent } from './shared/pages/forbidden/forbidden.component';

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
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];