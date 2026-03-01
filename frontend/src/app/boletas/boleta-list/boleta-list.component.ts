import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { Router }             from '@angular/router';
import { FormsModule }        from '@angular/forms';
import { MatTableModule }     from '@angular/material/table';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatChipsModule }     from '@angular/material/chips';
import { MatTooltipModule }   from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { BoletaService }          from '../../core/services/boleta.service';
import { NotificationService }    from '../../shared/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { Boleta }                 from '../../core/models/boleta.model';

@Component({
  selector: 'app-boleta-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatChipsModule, MatTooltipModule, MatProgressSpinnerModule, MatDialogModule,
  ],
  templateUrl: './boleta-list.component.html',
  styleUrls:   ['./boleta-list.component.css'],
})
export class BoletaListComponent implements OnInit {
  boletas:     Boleta[] = [];
  isLoading    = false;
  totalItems   = 0;
  currentPage  = 1;

  busqueda     = '';
  filtroEstado = '';
  filtroTipo   = '';

  displayedColumns = ['nombre', 'cliente', 'pais', 'tipo_interaccion', 'estado', 'acciones'];

  constructor(
    private boletaService:       BoletaService,
    private notificationService: NotificationService,
    private router:              Router,
    private dialog:              MatDialog,
  ) {}

  ngOnInit(): void { this.loadBoletas(); }

  loadBoletas(): void {
    this.isLoading = true;
    const filtros: Record<string, any> = { page: this.currentPage };
    if (this.busqueda)     filtros['busqueda']         = this.busqueda;
    if (this.filtroEstado) filtros['estado']            = this.filtroEstado;
    if (this.filtroTipo)   filtros['tipo_interaccion']  = this.filtroTipo;

    this.boletaService.getBoletas(filtros).subscribe({
      next: res => {
        this.boletas    = (res as any).data ?? [];
        this.totalItems = (res as any).meta?.total ?? 0;
        this.isLoading  = false;
      },
      error: () => {
        this.notificationService.showError('Error al cargar boletas');
        this.isLoading = false;
      },
    });
  }

  applyFiltros(): void { this.currentPage = 1; this.loadBoletas(); }
  clearFiltros(): void {
    this.busqueda = ''; this.filtroEstado = ''; this.filtroTipo = '';
    this.applyFiltros();
  }

  crearBoleta(): void         { this.router.navigate(['/boletas/nueva']); }
  editarBoleta(b: Boleta): void { this.router.navigate(['/boletas/editar', b.id]); }
  editarEstructura(b: Boleta): void { this.router.navigate(['/boletas', b.id, 'estructura']); }

  publicarBoleta(b: Boleta): void {
    this.confirm(
      'Activar boleta',
      `¿Activar "${b.nombre}"? El backend validará la estructura antes de activarla.`,
      'Activar',
    ).then(ok => {
      if (!ok) return;
      this.boletaService.activarBoleta(b.id).subscribe({
        next: () => { this.notificationService.showSuccess('Boleta activada'); this.loadBoletas(); },
        error: err => this.notificationService.showError(err.error?.message ?? 'No se pudo activar'),
      });
    });
  }

  inactivarBoleta(b: Boleta): void {
    this.confirm('Archivar boleta', `¿Archivar "${b.nombre}"?`, 'Archivar').then(ok => {
      if (!ok) return;
      this.boletaService.archivarBoleta(b.id).subscribe({
        next: () => { this.notificationService.showSuccess('Boleta archivada'); this.loadBoletas(); },
        error: err => this.notificationService.showError(err.error?.message ?? 'Error'),
      });
    });
  }

  eliminarBoleta(b: Boleta): void {
    this.confirm(
      'Eliminar boleta',
      `¿Eliminar "${b.nombre}"? Esta acción no se puede deshacer.`,
      'Eliminar',
    ).then(ok => {
      if (!ok) return;
      this.boletaService.deleteBoleta(b.id).subscribe({
        next: () => { this.notificationService.showSuccess('Boleta eliminada'); this.loadBoletas(); },
        error: err => this.notificationService.showError(err.error?.message ?? 'No se pudo eliminar'),
      });
    });
  }

  tipoLabel(tipo: string): string {
    const labels: Record<string, string> = { llamada: '📞 Llamada', chat: '💬 Chat', email: '✉️ Email' };
    return labels[tipo] ?? tipo;
  }

  private confirm(title: string, message: string, confirmText: string): Promise<boolean> {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: { title, message, confirmText, cancelText: 'Cancelar' },
    }).afterClosed().toPromise().then(r => r === true);
  }
}
