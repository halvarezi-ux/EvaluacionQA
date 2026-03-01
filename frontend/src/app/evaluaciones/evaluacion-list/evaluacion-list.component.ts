import { Component, OnInit }               from '@angular/core';
import { CommonModule }                     from '@angular/common';
import { Router }                           from '@angular/router';
import { FormsModule }                      from '@angular/forms';
import { MatTableModule }                   from '@angular/material/table';
import { MatButtonModule }                  from '@angular/material/button';
import { MatIconModule }                    from '@angular/material/icon';
import { MatFormFieldModule }               from '@angular/material/form-field';
import { MatInputModule }                   from '@angular/material/input';
import { MatSelectModule }                  from '@angular/material/select';
import { MatTooltipModule }                 from '@angular/material/tooltip';
import { MatProgressSpinnerModule }         from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent }    from '@angular/material/paginator';

import { EvaluacionService }               from '../services/evaluacion.service';
import { NotificationService }             from '../../shared/services/notification.service';
import { Evaluacion }                      from '../../core/models/boleta.model';
import { nivelClass }                      from '../models/evaluacion.model';

@Component({
  selector:    'app-evaluacion-list',
  standalone:  true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTooltipModule, MatProgressSpinnerModule,
    MatPaginatorModule,
  ],
  templateUrl: './evaluacion-list.component.html',
  styleUrls:   ['./evaluacion-list.component.css'],
})
export class EvaluacionListComponent implements OnInit {
  evaluaciones: Evaluacion[] = [];
  isLoading     = false;
  totalItems    = 0;
  currentPage   = 1;
  perPage       = 15;

  filtroAgenteNombre = '';
  filtroEstado       = '';

  displayedColumns = ['agente_nombre', 'area', 'nota_final', 'nivel_calidad', 'estado', 'acciones'];

  nivelClass = nivelClass;

  constructor(
    private evaluacionService: EvaluacionService,
    private notif:             NotificationService,
    private router:            Router,
  ) {}

  ngOnInit(): void { this.loadEvaluaciones(); }

  loadEvaluaciones(): void {
    this.isLoading = true;
    const f: Record<string, any> = { page: this.currentPage, per_page: this.perPage };
    if (this.filtroAgenteNombre) f['agente_nombre'] = this.filtroAgenteNombre;
    if (this.filtroEstado)       f['estado']        = this.filtroEstado;

    this.evaluacionService.getEvaluaciones(f).subscribe({
      next: res => {
        this.evaluaciones = res.data;
        this.totalItems   = res.meta?.total ?? res.data.length;
        this.isLoading    = false;
      },
      error: () => {
        this.notif.showError('Error al cargar evaluaciones');
        this.isLoading = false;
      },
    });
  }

  applyFiltros(): void { this.currentPage = 1; this.loadEvaluaciones(); }

  onPage(e: PageEvent): void {
    this.currentPage = e.pageIndex + 1;
    this.perPage     = e.pageSize;
    this.loadEvaluaciones();
  }

  clearFiltros(): void {
    this.filtroAgenteNombre = '';
    this.filtroEstado = '';
    this.applyFiltros();
  }

  verDetalle(e: Evaluacion): void { this.router.navigate(['/evaluaciones', e.id]); }
  nuevaEvaluacion(): void          { this.router.navigate(['/evaluaciones/nueva']); }

  scoreGradient(nota: number): string {
    if (nota >= 90) return 'linear-gradient(135deg, #10B981, #34D399)';
    if (nota >= 75) return 'linear-gradient(135deg, #3B82F6, #60A5FA)';
    if (nota >= 60) return 'linear-gradient(135deg, #F59E0B, #FCD34D)';
    return 'linear-gradient(135deg, #EF4444, #F87171)';
  }

  hayFiltros(): boolean { return !!(this.filtroAgenteNombre || this.filtroEstado); }
}
