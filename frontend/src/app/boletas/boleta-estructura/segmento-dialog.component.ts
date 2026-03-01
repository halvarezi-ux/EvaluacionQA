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
            <mat-option value="normal">Normal</mat-option>
            <mat-option value="critico">Crítico</mat-option>
            <mat-option value="resumen">Resumen</mat-option>
          </mat-select>
          <mat-hint>Crítico: errores anulan todo. Resumen: comentarios finales.</mat-hint>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Peso (%)</mat-label>
            <input matInput type="number" formControlName="peso" min="0" max="100" step="0.01">
            <mat-error *ngIf="form.get('peso')?.hasError('required')">Campo requerido</mat-error>
            <mat-error *ngIf="form.get('peso')?.hasError('min') || form.get('peso')?.hasError('max')">
              Entre 0 y 100
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Penalización (%)</mat-label>
            <input matInput type="number" formControlName="penalizacion" min="0" max="100" step="0.01">
            <mat-hint>Si aplica</mat-hint>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Orden</mat-label>
          <input matInput type="number" formControlName="orden" min="1">
          <mat-hint>Posición en la boleta</mat-hint>
        </mat-form-field>
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
      gap: 16px;
      min-width: 500px;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    mat-dialog-content {
      padding: 20px 24px;
    }
  `]
})
export class SegmentoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private segmentoService = inject(SegmentoService);
  private notificationService = inject(NotificationService);
  
  dialogRef = inject(MatDialogRef<SegmentoDialogComponent>);
  data = inject<{ segmento?: Segmento; versionId: number }>(MAT_DIALOG_DATA);

  form!: FormGroup;
  guardando = false;

  ngOnInit(): void {
    const segmento = this.data.segmento;
    this.form = this.fb.group({
      nombre: [segmento?.nombre || '', Validators.required],
      tipo: [segmento?.tipo || 'normal', Validators.required],
      peso: [segmento?.peso || 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      penalizacion: [segmento?.penalizacion || 0, [Validators.min(0), Validators.max(100)]],
      orden: [segmento?.orden || 1, [Validators.required, Validators.min(1)]],
    });
  }

  guardar(): void {
    if (this.form.invalid) return;

    this.guardando = true;
    const dto: CreateSegmentoDto = this.form.value;

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
