import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { BoletaService } from '../core/services/boleta.service';
import { EvaluacionService } from '../evaluaciones/services/evaluacion.service';
import { Evaluacion } from '../core/models/boleta.model';
import { nivelClass, nivelColor } from '../evaluaciones/models/evaluacion.model';

interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  bg: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule,
            MatProgressSpinnerModule, MatTooltipModule],
  template: `
    <div class="dash-wrap">

      <!-- Header -->
      <div class="dash-header">
        <div class="dash-title-block">
          <mat-icon class="dash-icon">dashboard</mat-icon>
          <div>
            <h1 class="dash-title">Dashboard</h1>
            <p class="dash-sub">Resumen del sistema de calidad</p>
          </div>
        </div>
        <button mat-stroked-button (click)="recargar()" [disabled]="loading" class="btn-refresh">
          <mat-icon>refresh</mat-icon> Actualizar
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-center">
        <mat-spinner [diameter]="44"></mat-spinner>
        <span>Cargando métricas...</span>
      </div>

      <!-- Stat cards -->
      <div class="stats-grid" *ngIf="!loading">
        <div class="stat-card" *ngFor="let s of stats"
             [style.border-left-color]="s.color"
             [class.clickable]="s.route"
             (click)="s.route && router.navigate([s.route])">
          <div class="stat-icon-wrap" [style.background]="s.bg">
            <mat-icon [style.color]="s.color">{{ s.icon }}</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ s.value }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
      </div>

      <!-- Últimas evaluaciones -->
      <div class="section" *ngIf="!loading && recientes.length">
        <div class="section-header">
          <h2><mat-icon>history</mat-icon> Evaluaciones recientes</h2>
          <button mat-stroked-button (click)="router.navigate(['/evaluaciones'])">
            Ver todas <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>
        <div class="eval-list">
          <div class="eval-row" *ngFor="let e of recientes">
            <div class="eval-avatar">{{ e.agente_nombre.charAt(0).toUpperCase() }}</div>
            <div class="eval-info">
              <span class="eval-agente">{{ e.agente_nombre }}</span>
              <span class="eval-boleta">{{ e.area?.nombre ?? '—' }}</span>
            </div>
            <div class="eval-score">
              <div class="score-bar-bg">
                <div class="score-bar-fill"
                     [style.width.%]="e.nota_final"
                     [style.background]="gradient(e.nota_final)"></div>
              </div>
              <span class="score-val" [style.color]="scoreColor(e.nota_final)">{{ e.nota_final }}%</span>
            </div>
            <span class="nivel-chip" [class]="nivelClass(e.nivel_calidad)">{{ e.nivel_calidad }}</span>
            <button mat-icon-button matTooltip="Ver detalle"
                    (click)="router.navigate(['/evaluaciones', e.id])">
              <mat-icon>open_in_new</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="!loading && recientes.length === 0">
        <mat-icon>assessment</mat-icon>
        <h3>No hay evaluaciones aún</h3>
        <p>Crea la primera evaluación para ver métricas aquí.</p>
        <button mat-raised-button color="primary" (click)="router.navigate(['/evaluaciones/nueva'])">
          <mat-icon>add</mat-icon> Nueva evaluación
        </button>
      </div>

    </div>
  `,
  styles: [`
    .dash-wrap { padding: 28px 32px; max-width: 1100px; margin: 0 auto; }

    .dash-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 28px;
    }
    .dash-title-block { display: flex; align-items: center; gap: 14px; }
    .dash-icon { font-size: 32px; width: 32px; height: 32px; color: #4F46E5; }
    .dash-title { margin: 0; font-size: 22px; font-weight: 800; color: #1E1B4B; }
    .dash-sub { margin: 3px 0 0; font-size: 13px; color: #6B7280; }

    .loading-center {
      display: flex; flex-direction: column; align-items: center;
      gap: 14px; padding: 60px; color: #6B7280;
    }

    /* Stats grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px; margin-bottom: 32px;
    }
    .stat-card {
      background: #fff; border-radius: 14px; padding: 20px 18px;
      display: flex; align-items: center; gap: 16px;
      border-left: 4px solid #E5E7EB;
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
      transition: box-shadow .15s, transform .15s;
    }
    .stat-card.clickable { cursor: pointer; }
    .stat-card.clickable:hover { box-shadow: 0 4px 14px rgba(79,70,229,.12); transform: translateY(-2px); }
    .stat-icon-wrap {
      width: 44px; height: 44px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .stat-value { font-size: 26px; font-weight: 800; color: #1E1B4B; display: block; }
    .stat-label { font-size: 12px; color: #6B7280; font-weight: 500; display: block; }

    /* Recientes */
    .section { background: #fff; border-radius: 14px; padding: 18px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
    .section-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;
      h2 { margin: 0; font-size: 15px; font-weight: 700; color: #1E1B4B; display: flex; align-items: center; gap: 8px;
           mat-icon { color: #4F46E5; font-size: 18px; width: 18px; height: 18px; } }
    }
    .eval-list { display: flex; flex-direction: column; gap: 8px; }
    .eval-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 10px; background: #FAFAFA;
      transition: background .12s;
      &:hover { background: #F0F0FF; }
    }
    .eval-avatar {
      width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
      background: #4F46E5; color: #fff; font-weight: 700; font-size: 15px;
      display: flex; align-items: center; justify-content: center;
    }
    .eval-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .eval-agente { font-size: 13px; font-weight: 600; color: #1E1B4B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .eval-boleta { font-size: 11px; color: #9CA3AF; }
    .eval-score { display: flex; align-items: center; gap: 8px; width: 160px; flex-shrink: 0; }
    .score-bar-bg { flex: 1; height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden; }
    .score-bar-fill { height: 100%; border-radius: 3px; transition: width .3s; }
    .score-val { font-size: 13px; font-weight: 700; width: 38px; text-align: right; flex-shrink: 0; }

    .nivel-chip { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; flex-shrink: 0; }
    .nivel-excelente  { background: #D1FAE5; color: #065F46; }
    .nivel-bueno      { background: #DBEAFE; color: #1D4ED8; }
    .nivel-regular    { background: #FEF9C3; color: #92400E; }
    .nivel-critico    { background: #FEE2E2; color: #991B1B; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      padding: 60px; color: #6B7280; text-align: center;
      mat-icon { font-size: 52px; width: 52px; height: 52px; color: #C7D2FE; }
      h3 { margin: 0; color: #374151; }
      p { margin: 0; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  stats: StatCard[] = [];
  recientes: Evaluacion[] = [];
  nivelClass = nivelClass;

  constructor(
    public router: Router,
    private boletaService: BoletaService,
    private evaluacionService: EvaluacionService,
  ) {}

  ngOnInit(): void { this.cargar(); }

  recargar(): void { this.loading = true; this.stats = []; this.recientes = []; this.cargar(); }

  private cargar(): void {
    forkJoin({
      boletas:      this.boletaService.getBoletas({ per_page: 1 }),
      publicadas:   this.boletaService.getBoletas({ estado: 'publicada', per_page: 1 }),
      borradores:   this.boletaService.getBoletas({ estado: 'borrador', per_page: 1 }),
      evaluaciones: this.evaluacionService.getEvaluaciones({ per_page: 1 }),
      completadas:  this.evaluacionService.getEvaluaciones({ estado: 'completada', per_page: 1 }),
      recientes:    this.evaluacionService.getEvaluaciones({ per_page: 6 }),
    }).subscribe({
      next: (r) => {
        const totalBoletas  = (r.boletas as any).meta?.total ?? (r.boletas as any).data?.length ?? 0;
        const publicadas    = (r.publicadas as any).meta?.total ?? (r.publicadas as any).data?.length ?? 0;
        const borradores    = (r.borradores as any).meta?.total ?? (r.borradores as any).data?.length ?? 0;
        const totalEval     = r.evaluaciones.meta?.total ?? r.evaluaciones.data.length;
        const completadas   = r.completadas.meta?.total ?? r.completadas.data.length;

        this.stats = [
          { label: 'Boletas totales',    value: totalBoletas, icon: 'assignment',   color: '#4F46E5', bg: '#EEF2FF', route: '/boletas' },
          { label: 'Boletas activas',    value: publicadas,   icon: 'cloud_done',   color: '#10B981', bg: '#D1FAE5', route: '/boletas' },
          { label: 'Borradores',         value: borradores,   icon: 'edit_note',    color: '#F59E0B', bg: '#FEF9C3', route: '/boletas' },
          { label: 'Evaluaciones total', value: totalEval,    icon: 'fact_check',   color: '#3B82F6', bg: '#DBEAFE', route: '/evaluaciones' },
          { label: 'Completadas',        value: completadas,  icon: 'check_circle', color: '#10B981', bg: '#D1FAE5', route: '/evaluaciones' },
          { label: 'En borrador',        value: totalEval - completadas, icon: 'pending', color: '#8B5CF6', bg: '#EDE9FE', route: '/evaluaciones' },
        ];
        this.recientes = r.recientes.data;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  gradient(nota: number): string {
    if (nota >= 90) return 'linear-gradient(135deg,#10B981,#34D399)';
    if (nota >= 75) return 'linear-gradient(135deg,#3B82F6,#60A5FA)';
    if (nota >= 60) return 'linear-gradient(135deg,#F59E0B,#FCD34D)';
    return 'linear-gradient(135deg,#EF4444,#F87171)';
  }

  scoreColor(nota: number): string {
    if (nota >= 90) return '#10B981';
    if (nota >= 75) return '#3B82F6';
    if (nota >= 60) return '#D97706';
    return '#EF4444';
  }
}