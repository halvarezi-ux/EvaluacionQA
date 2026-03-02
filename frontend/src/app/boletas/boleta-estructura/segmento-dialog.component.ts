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
            <mat-option value="" disabled>― Seleccione el tipo de segmento ―</mat-option>
            <mat-option value="normal" [disabled]="(data.pesoRestante ?? 100) <= 0">
              📋 Estándar — preguntas de evaluación estándar
              <ng-container *ngIf="(data.pesoRestante ?? 100) <= 0">
                &nbsp;(sin % disponible)
              </ng-container>
            </mat-option>
            <mat-option value="critico">⛔ Crítico — un “No” puede anular toda la evaluación</mat-option>
            <mat-option value="resumen">🗒️ Resumen — campos de observación y comentarios finales</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('tipo')?.hasError('required')">Seleccione un tipo</mat-error>
        </mat-form-field>

        <!-- Peso (solo Estándar — no aplica para Crítico ni Resumen) -->
        <mat-form-field appearance="outline"
            *ngIf="form.get('tipo')?.value !== 'resumen' && form.get('tipo')?.value !== 'critico'">

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

        <!-- Penalización (solo Crítico) -->
        <ng-container *ngIf="form.get('tipo')?.value === 'critico'">
          <mat-form-field appearance="outline" class="penalizacion-field">
            <mat-label>Penalización (pts)</mat-label>
            <input matInput type="number" formControlName="penalizacion"
                   min="0" [max]="data.totalGlobal ?? 100" step="1">
            <span matSuffix style="padding-right:8px;color:#6B7280;font-size:13px">pts</span>
            <mat-hint align="start">
              Máximo permitido: <strong>{{ data.totalGlobal ?? 100 }} pts</strong>
            </mat-hint>
          </mat-form-field>
          <!-- Error alert para exceder máximo -->
          <div class="penalizacion-error-alert" *ngIf="form.get('penalizacion')?.hasError('max')">
            <mat-icon>error_outline</mat-icon>
            <div class="error-content">
              <div class="error-title">Penalización excede el máximo</div>
              <div class="error-desc">No puedes establecer una penalización mayor a <strong>{{ data.totalGlobal ?? 100 }} pts</strong> 
              (el total de puntos de la boleta).</div>
            </div>
          </div>
          <!-- Badge de severidad -->
          <div class="severidad-badge"
               [class.sev-grave]="criticoSeveridad >= 91"
               [class.sev-alto]="criticoSeveridad >= 50 && criticoSeveridad < 91"
               [class.sev-leve]="criticoSeveridad > 0 && criticoSeveridad < 50"
               *ngIf="criticoSeveridad > 0 && !form.get('penalizacion')?.hasError('max')">
            <span *ngIf="criticoSeveridad >= 91">🔴 Gravedad <strong>Extrema</strong> &mdash; penaliza {{ criticoSeveridad }} pts ({{ criticoPct }}% del total)</span>
            <span *ngIf="criticoSeveridad >= 50 && criticoSeveridad < 91">🟠 Gravedad <strong>Alta</strong> &mdash; penaliza {{ criticoSeveridad }} pts ({{ criticoPct }}% del total)</span>
            <span *ngIf="criticoSeveridad > 0 && criticoSeveridad < 50">🟡 Gravedad <strong>Moderada</strong> &mdash; penaliza {{ criticoSeveridad }} pts ({{ criticoPct }}% del total)</span>
          </div>
        </ng-container>

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
    .severidad-badge {
      padding: 9px 14px; border-radius: 8px; font-size: 12.5px; line-height: 1.5;
      border: 1.5px solid transparent;
    }
    .sev-grave { background: #FEF2F2; color: #991B1B; border-color: #FECACA; }
    .sev-grave strong { color: #7F1D1D; }
    .sev-alto  { background: #FFF7ED; color: #9A3412; border-color: #FED7AA; }
    .sev-alto  strong { color: #7C2D12; }
    .sev-leve  { background: #FEFCE8; color: #854D0E; border-color: #FEF08A; }
    .sev-leve  strong { color: #713F12; }
    /* Penalización field & error alert */
    .penalizacion-field { width: 100%; }
    .penalizacion-error-alert {
      display: flex; gap: 12px; align-items: flex-start;
      padding: 11px 14px; margin-top: 8px; border-radius: 8px;
      background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
      border: 1.5px solid #FECACA; color: #991B1B; font-size: 13px; line-height: 1.5;
    }
    .penalizacion-error-alert mat-icon {
      flex-shrink: 0; color: #DC2626; margin-top: 0px ; width: 18px; height: 18px; font-size: 18px;
    }
    .error-content { flex: 1 1 auto; }
    .error-title { font-weight: 700; color: #7F1D1D; margin-bottom: 2px; }
    .error-desc { font-size: 12.5px; color: #991B1B; }
    .error-desc strong { font-weight: 700; color: #7F1D1D; }
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

  /** Penalización actual ingresada (para reactive display). */
  get criticoSeveridad(): number { return Number(this.form?.get('penalizacion')?.value ?? 0); }
  get criticoPct(): number {
    const total = this.data.totalGlobal ?? 100;
    return total > 0 ? Math.round(this.criticoSeveridad / total * 100) : 0;
  }

  /** True when reducing peso would leave existing question pts without room (solo segmentos estándar). */
  get pesoInsuficiente(): boolean {
    if (!this.data.segmento || !this.data.ptsUsados || this.data.ptsUsados === 0) return false;
    if (this.form?.get('tipo')?.value !== 'normal') return false;
    return this.ptsPermitidosConNuevoPeso < this.data.ptsUsados;
  }

  form!: FormGroup;
  guardando = false;

  ngOnInit(): void {
    const segmento = this.data.segmento;
    this.form = this.fb.group({
      nombre:       [segmento?.nombre || '', Validators.required],
      tipo:         [segmento?.tipo || '', Validators.required],
      peso:         [segmento?.peso ?? 0, [Validators.required, Validators.min(0), Validators.max(this.maxPeso)]],
      penalizacion: [segmento?.penalizacion ?? 0, [Validators.required, Validators.min(0), Validators.max(this.data.totalGlobal ?? 100)]],
    });

    // Resumen y Crítico no consumen % de la boleta → fijar peso a 0
    this.form.get('tipo')!.valueChanges.subscribe(tipo => {
      if (tipo === 'resumen' || tipo === 'critico') {
        this.form.get('peso')!.setValue(0, { emitEvent: false });
      }
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
      // Para no-critico conservar la penalización original; para critico usar la del form
      penalizacion: this.form.value.tipo === 'critico'
        ? (this.form.value.penalizacion ?? 0)
        : (this.data.segmento?.penalizacion ?? 0),
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

