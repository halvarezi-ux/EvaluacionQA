import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { TokenService } from '../../auth/token.service';

interface NavItem {
  label: string;
  icon:  string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private tokenService = inject(TokenService);
  private router       = inject(Router);
  private bp           = inject(BreakpointObserver);

  currentUser: any = null;
  isMobile = false;

  navItems: NavItem[] = [
    { label: 'Dashboard',    icon: 'dashboard',    route: '/dashboard',       roles: ['Admin', 'QA Lead', 'QA', 'Analista', 'Asesor'] },
    { label: 'Usuarios',     icon: 'people',       route: '/admin/usuarios',  roles: ['Admin'] },
    { label: 'Boletas',      icon: 'assignment',   route: '/boletas',         roles: ['Admin', 'QA Lead'] },
    { label: 'Evaluaciones', icon: 'fact_check',   route: '/evaluaciones',    roles: ['Admin', 'QA Lead', 'QA'] },
  ];

  get visibleItems(): NavItem[] {
    const role = this.getUserRole();
    return this.navItems.filter(item => item.roles.includes(role));
  }

  ngOnInit(): void {
    this.currentUser = this.tokenService.getUser();

    this.bp.observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .pipe(map(r => r.matches))
      .subscribe(mobile => { this.isMobile = mobile; });
  }

  getUserRole(): string {
    const user = this.currentUser;
    if (!user) return '';
    return typeof user.role === 'object' ? (user.role?.nombre ?? '') : (user.role ?? '');
  }

  getUserInitials(): string {
    const name: string = this.currentUser?.name ?? 'U';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  logout(): void {
    this.router.navigate(['/logout']);
  }

  toggleSidenav(): void {
    this.sidenav?.toggle();
  }
}
