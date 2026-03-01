import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BoletaService } from '../../core/services/boleta.service';
import { SegmentoService } from '../../core/services/segmento.service';
import { PreguntaService } from '../../core/services/pregunta.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Boleta, BoletaVersion, Segmento, Pregunta } from '../../core/models/boleta.model';
import { SegmentoDialogComponent } from './segmento-dialog.component';
import { PreguntaDialogComponent } from './pregunta-dialog.component';

@Component({
  selector: 'app-boleta-estructura',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatChipsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="container">
      <div class="header">
        <button mat-icon-button (click)="volver()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1>Estructura de Boleta</h1>
          <p class="subtitle" *ngIf="boleta">{{ boleta.nombre }} - Versión {{ versionActiva?.numero_version }}</p>
        </div>
        <button mat-raised-button color="primary" 
                (click)="distribuirPesos()"
                [disabled]="!versionActiva || segmentos.length === 0"
                matTooltip="Distribuir pesos equitativamente entre segmentos">
          <mat-icon>balance</mat-icon>
          Distribuir Pesos
        </button>
      </div>

      <mat-spinner *ngIf="loading" diameter="50"></mat-spinner>

      <div *ngIf="!loading && versionActiva">
        <!-- Información de la versión -->
        <mat-card class="version-info">
          <mat-card-content>
            <div class="info-grid">
              <div>
                <strong>Total Global:</strong> {{ boleta?.total_global }} puntos
              </div>
              <div>
                <strong>Estado:</strong> 
                <mat-chip [class.chip-draft]="boleta?.estado === 'draft'"
                          [class.chip-activa]="boleta?.estado === 'activa'"
                          [class.chip-archivada]="boleta?.estado === 'archivada'">
                  {{ boleta?.estado_label }}
                </mat-chip>
              </div>
              <div>
                <strong>Segmentos:</strong> {{ segmentos.length }}
              </div>
              <div>
                <strong>Suma de pesos:</strong> {{ sumaPesos() }}%
                <mat-icon *ngIf="sumaPesos() !== 100" color="warn" matTooltip="La suma debe ser 100%">warning</mat-icon>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Lista de segmentos -->
        <div class="actions-bar">
          <button mat-raised-button color="primary" (click)="crearSegmento()" [disabled]="!versionActiva?.es_editable">
            <mat-icon>add</mat-icon>
            Nuevo Segmento
          </button>
        </div>

        <mat-accordion *ngIf="segmentos.length > 0">
          <mat-expansion-panel *ngFor="let segmento of segmentos">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <strong>{{ segmento.nombre }}</strong>
                <mat-chip class="ml-2">{{ segmento.tipo_label }}</mat-chip>
              </mat-panel-title>
              <mat-panel-description>
                Peso: {{ segmento.peso }}% | Preguntas: {{ segmento.preguntas?.length || 0 }}
                <span *ngIf="segmento.penalizacion" class="ml-2" style="color: #f44336;">
                  Penalización: -{{ segmento.penalizacion }}%
                </span>
              </mat-panel-description>
            </mat-expansion-panel-header>

            <!-- Preguntas del segmento -->
            <div class="preguntas-container">
              <div class="preguntas-header">
                <h3>Preguntas</h3>
                <div>
                  <button mat-button color="primary" (click)="crearPregunta(segmento)" [disabled]="!versionActiva?.es_editable">
                    <mat-icon>add</mat-icon>
                    Nueva Pregunta
                  </button>
                  <button mat-icon-button (click)="editarSegmento(segmento)" [disabled]="!versionActiva?.es_editable">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="eliminarSegmento(segmento)" [disabled]="!versionActiva?.es_editable">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>

              <div *ngIf="!segmento.preguntas || segmento.preguntas.length === 0" class="empty-state">
                <mat-icon>quiz</mat-icon>
                <p>No hay preguntas en este segmento</p>
              </div>

              <mat-card *ngFor="let pregunta of segmento.preguntas" class="pregunta-card">
                <mat-card-content>
                  <div class="pregunta-header">
                    <div class="pregunta-info">
                      <strong>{{ pregunta.texto }}</strong>
                      <div class="pregunta-meta">
                        <mat-chip>{{ pregunta.tipo_label }}</mat-chip>
                        <span>Peso: {{ pregunta.peso ?? '—' }}%</span>
                        <span *ngIf="pregunta.anula_segmento" style="color: #f44336;">⚠ Anula segmento</span>
                      </div>
                    </div>
                    <div class="pregunta-actions">
                      <button mat-icon-button (click)="editarPregunta(segmento, pregunta)" [disabled]="!versionActiva?.es_editable">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="eliminarPregunta(segmento, pregunta)" [disabled]="!versionActiva?.es_editable">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>

                  <!-- Opciones de respuesta -->
                  <div *ngIf="pregunta.opciones && pregunta.opciones.length > 0" class="opciones-container">
                    <strong>Opciones:</strong>
                    <ul class="opciones-list">
                      <li *ngFor="let opcion of pregunta.opciones">
                        {{ opcion.texto }} 
                        <span class="opcion-puntos">({{ opcion.valor }} pts)</span>
                      </li>
                    </ul>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-expansion-panel>
        </mat-accordion>

        <div *ngIf="segmentos.length === 0" class="empty-state-main">
          <mat-icon>layers</mat-icon>
          <h2>No hay segmentos definidos</h2>
          <p>Comienza creando el primer segmento de esta boleta</p>
          <button mat-raised-button color="primary" (click)="crearSegmento()">
            <mat-icon>add</mat-icon>
            Crear Primer Segmento
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      h1 {
        margin: 0;
        font-size: 24px;
      }
      .subtitle {
        margin: 4px 0 0 0;
        color: #666;
        font-size: 14px;
      }
    }
    .version-info {
      margin-bottom: 24px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .actions-bar {
      margin-bottom: 16px;
    }
    .preguntas-container {
      padding: 16px 0;
    }
    .preguntas-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      h3 {
        margin: 0;
      }
    }
    .pregunta-card {
      margin-bottom: 12px;
    }
    .pregunta-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .pregunta-info {
      flex: 1;
    }
    .pregunta-meta {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-top: 8px;
      font-size: 13px;
      color: #666;
      mat-chip {
        height: 24px;
      }
    }
    .pregunta-actions {
      display: flex;
      gap: 4px;
    }
    .opciones-container {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e0e0e0;
    }
    .opciones-list {
      margin: 8px 0 0 0;
      padding-left: 20px;
      li {
        margin-bottom: 4px;
      }
    }
    .opcion-puntos {
      color: #2196F3;
      font-weight: 500;
    }
    .empty-state {
      text-align: center;
      padding: 32px;
      color: #999;
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.3;
      }
    }
    .empty-state-main {
      text-align: center;
      padding: 64px 32px;
      mat-icon {
        font-size: 96px;
        width: 96px;
        height: 96px;
        opacity: 0.2;
      }
      h2 {
        color: #666;
      }
      p {
        color: #999;
        margin-bottom: 24px;
      }
    }
    .chip-draft { background-color: #FFC107; }
    .chip-activa { background-color: #4CAF50; color: white; }
    .chip-archivada { background-color: #9E9E9E; color: white; }
    .ml-2 { margin-left: 8px; }
    mat-spinner {
      margin: 40px auto;
    }
  `]
})
export class BoletaEstructuraComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private boletaService = inject(BoletaService);
  private segmentoService = inject(SegmentoService);
  private preguntaService = inject(PreguntaService);
  private notificationService = inject(NotificationService);

  boletaId!: number;
  boleta: Boleta | null = null;
  versionActiva: BoletaVersion | null = null;
  segmentos: Segmento[] = [];
  loading = true;

  ngOnInit(): void {
    this.boletaId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.boletaService.getBoleta(this.boletaId).subscribe({
      next: (boleta) => {
        this.boleta = boleta;
        this.versionActiva = boleta.versiones?.find(v => v.es_activa) || null;
        if (this.versionActiva) {
          this.cargarSegmentos();
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar la boleta');
        this.loading = false;
      }
    });
  }

  cargarSegmentos(): void {
    if (!this.versionActiva) return;
    this.segmentoService.getSegmentos(this.versionActiva.id).subscribe({
      next: (segmentos) => {
        this.segmentos = segmentos;
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar segmentos');
        this.loading = false;
      }
    });
  }

  crearSegmento(): void {
    const dialogRef = this.dialog.open(SegmentoDialogComponent, {
      width: '600px',
      data: { versionId: this.versionActiva!.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarSegmentos();
      }
    });
  }

  editarSegmento(segmento: Segmento): void {
    const dialogRef = this.dialog.open(SegmentoDialogComponent, {
      width: '600px',
      data: { segmento, versionId: this.versionActiva!.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarSegmentos();
      }
    });
  }

  eliminarSegmento(segmento: Segmento): void {
    if (!confirm(`¿Eliminar el segmento "${segmento.nombre}"? Se eliminarán también todas sus preguntas.`)) return;

    this.segmentoService.deleteSegmento(segmento.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Segmento eliminado');
        this.cargarSegmentos();
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message ?? 'Error al eliminar');
      }
    });
  }

  crearPregunta(segmento: Segmento): void {
    const dialogRef = this.dialog.open(PreguntaDialogComponent, {
      width: '700px',
      data: { segmentoId: segmento.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarSegmentos();
      }
    });
  }

  editarPregunta(segmento: Segmento, pregunta: Pregunta): void {
    const dialogRef = this.dialog.open(PreguntaDialogComponent, {
      width: '700px',
      data: { pregunta, segmentoId: segmento.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarSegmentos();
      }
    });
  }

  eliminarPregunta(segmento: Segmento, pregunta: Pregunta): void {
    if (!confirm(`¿Eliminar la pregunta "${pregunta.texto}"?`)) return;

    this.preguntaService.deletePregunta(pregunta.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Pregunta eliminada');
        this.cargarSegmentos();
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message ?? 'Error al eliminar');
      }
    });
  }

  distribuirPesos(): void {
    if (!this.segmentos.length) return;
    
    // Distribuir sobre el primer segmento como ejemplo
    this.segmentoService.distribuirPesos(this.segmentos[0].id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Pesos distribuidos equitativamente');
        this.cargarSegmentos();
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message ?? 'Error al distribuir');
      }
    });
  }

  sumaPesos(): number {
    return this.segmentos.reduce((sum, s) => sum + Number(s.peso), 0);
  }

  volver(): void {
    this.router.navigate(['/boletas']);
  }
}
