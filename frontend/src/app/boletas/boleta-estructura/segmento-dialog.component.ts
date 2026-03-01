import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SegmentoService } from '../../core/services/segmento.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Segmento, CreateSegmentoDto, TipoSegmento } from '../../core/models/boleta.model';

@Component({
  selector: 'app-segmento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.segmento ? 'Editar' : 'Nuevo' }} Segmento</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">

        <mat-form-field appearance="outline">
          <mat-label>Nombre del segmento</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej: Presentación y protocolo">
          <mat-error *ngIf="form.get('nombre')?.hasError('required')">Campo requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tipo de segmento</mat-label>
          <mat-select formControlName="tipo">
            <mat-option value="normal" [disabled]="!data.segmento && (data.pesoRestante ?? 100) <= 0">
              📋 Normal — preguntas de evaluación estándar
              <ng-container *ngIf="!data.segmento && (data.pesoRestante ?? 100) <= 0">
                &nbsp;(sin % disponible)
              </ng-container>
            </mat-option>
            <mat-option value="critico">⛔ Crítico — un "No" puede anular toda la evaluación</mat-option>
            <mat-option value="resumen">📝 Resumen — campos de observación y comentarios finales</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Peso del segmento (%)</mat-label>
          <input matInput type="number" formControlName="peso" min="0" [max]="maxPeso" step="0.01">
          <mat-hint>
            <ng-container *ngIf="data.pesoRestante != null && !data.segmento">
              Disponible: <strong>{{ maxPeso }}%</strong> &mdash; todos los segmentos deben sumar 100%
            </ng-container>
            <ng-container *ngIf="data.segmento && !pesoInsuficiente">
              Máximo permitido: <strong>{{ maxPeso }}%</strong>
            </ng-container>
          </mat-hint>
          <mat-error *ngIf="form.get('peso')?.hasError('required')">Requerido</mat-error>
          <mat-error *ngIf="form.get('peso')?.hasError('min') || form.get('peso')?.hasError('max')">
            Debe estar entre 0 y {{ maxPeso }}%
          </mat-error>
        </mat-form-field>

        <!-- Warning: reducing peso below pts already used -->
        <div class="pts-conflict-alert" *ngIf="pesoInsuficiente">
          <strong>⚠️ No puedes bajar a este peso.</strong><br>
          Con {{ form.get('peso')?.value }}% el segmento solo admite
          <strong>{{ ptsPermitidosConNuevoPeso }} pts</strong>, pero tus preguntas
          ya usan <strong>{{ data.ptsUsados }} pts</strong>.
          Primero reduce la ponderación de las preguntas del segmento.
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="guardar()" [disabled]="form.invalid || guardando">
        {{ guardando ? 'Guardando...' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-width: 520px;
      padding-top: 8px;
    }
    mat-dialog-content { padding: 16px 24px 8px; }
    mat-hint { font-size: 11.5px; line-height: 1.5; }
    .pts-conflict-alert {
      padding: 10px 14px; background: #FEF2F2; border: 1.5px solid #FECACA;
      border-radius: 8px; font-size: 12.5px; color: #991B1B; line-height: 1.6;
    }
    .pts-conflict-alert strong { color: #7F1D1D; }
  `]
})
export class SegmentoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private segmentoService = inject(SegmentoService);
  private notificationService = inject(NotificationService);
  
  dialogRef = inject(MatDialogRef<SegmentoDialogComponent>);
  data = inject<{ segmento?: Segmento; versionId: number; pesoRestante?: number; ptsUsados?: number; totalGlobal?: number }>(MAT_DIALOG_DATA);

  /** Max peso this segmento may have (remaining capacity from parent). */
  get maxPeso(): number { return Math.round((this.data.pesoRestante ?? 100) * 100) / 100; }

  /** Pts this segment would allow with the current peso typed by the user. */
  get ptsPermitidosConNuevoPeso(): number {
    const peso = Number(this.form?.get('peso')?.value ?? 0);
    return Math.round((this.data.totalGlobal ?? 100) * peso / 100 * 100) / 100;
  }

  /** True when reducing peso would leave existing question pts without room. */
  get pesoInsuficiente(): boolean {
    if (!this.data.segmento || !this.data.ptsUsados || this.data.ptsUsados === 0) return false;
    return this.ptsPermitidosConNuevoPeso < this.data.ptsUsados;
  }

  form!: FormGroup;
  guardando = false;

  ngOnInit(): void {
    const segmento = this.data.segmento;
    this.form = this.fb.group({
      nombre:       [segmento?.nombre || '', Validators.required],
      tipo:         [segmento?.tipo || 'normal', Validators.required],
      peso:         [segmento?.peso ?? 0, [Validators.required, Validators.min(0), Validators.max(this.maxPeso)]],
    });
  }

  guardar(): void {
    if (this.form.invalid) return;

    // Block save if reducing peso would invalidate existing question pts
    if (this.pesoInsuficiente) {
      this.notificationService.showError(
        `El peso ${this.form.value.peso}% solo permite ${this.ptsPermitidosConNuevoPeso} pts, ` +
        `pero las preguntas del segmento ya usan ${this.data.ptsUsados} pts. ` +
        `Reduce la ponderación de las preguntas primero.`
      );
      return;
    }

    this.guardando = true;
    const dto: CreateSegmentoDto = {
      ...this.form.value,
      penalizacion: this.data.segmento?.penalizacion ?? 0,
    };

    const request$ = this.data.segmento
      ? this.segmentoService.updateSegmento(this.data.segmento.id, dto)
      : this.segmentoService.createSegmento(this.data.versionId, dto);

    request$.subscribe({
      next: () => {
        this.notificationService.showSuccess(
          this.data.segmento ? 'Segmento actualizado' : 'Segmento creado'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message ?? 'Error al guardar');
        this.guardando = false;
      }
    });
  }
}

