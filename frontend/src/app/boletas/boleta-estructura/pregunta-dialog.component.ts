import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { PreguntaService } from '../../core/services/pregunta.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Pregunta, CreatePreguntaDto, TipoPregunta } from '../../core/models/boleta.model';

@Component({
  selector: 'app-pregunta-dialog',
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
    MatIconModule,
    MatDividerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.pregunta ? 'Editar' : 'Nueva' }} Pregunta</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <mat-form-field appearance="outline">
          <mat-label>Texto de la pregunta</mat-label>
          <textarea matInput formControlName="texto" rows="3" 
                    placeholder="Ej: ¿El agente saludó correctamente al cliente?"></textarea>
          <mat-error *ngIf="form.get('texto')?.hasError('required')">Campo requerido</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tipo de pregunta</mat-label>
          <mat-select formControlName="tipo" (selectionChange)="onTipoPreguntaChange()">
            <mat-option value="si_no">Sí / No</mat-option>
            <mat-option value="opcion_multiple">Opción Múltiple</mat-option>
            <mat-option value="porcentaje">Porcentaje (0-100%)</mat-option>
            <mat-option value="numerica">Numérica</mat-option>
            <mat-option value="checklist">Checklist</mat-option>
            <mat-option value="texto_libre">Texto Libre</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Peso (%)</mat-label>
            <input matInput type="number" formControlName="peso" min="0" max="100" step="0.01">
            <mat-error *ngIf="form.get('peso_pregunta')?.hasError('required')">Campo requerido</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Orden</mat-label>
            <input matInput type="number" formControlName="orden" min="1">
          </mat-form-field>
        </div>

        <div class="row">
          <mat-slide-toggle formControlName="anula_segmento">
            Anula el segmento completo
          </mat-slide-toggle>

          <mat-form-field appearance="outline">
            <mat-label>Comentario requerido</mat-label>
            <mat-select formControlName="comentario_requerido">
              <mat-option value="nunca">Nunca</mat-option>
              <mat-option value="siempre">Siempre</mat-option>
              <mat-option value="si_es_no">Si es "No"</mat-option>
              <mat-option value="si_es_si">Si es "Sí"</mat-option>
              <mat-option value="si_penaliza">Si penaliza</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Opciones de respuesta (para si_no, opcion_multiple, checklist) -->
        <div *ngIf="requiereOpciones()" class="opciones-section">
          <mat-divider></mat-divider>
          <div class="opciones-header">
            <h3>Opciones de Respuesta</h3>
            <button mat-icon-button type="button" (click)="agregarOpcion()" color="primary">
              <mat-icon>add_circle</mat-icon>
            </button>
          </div>

          <div formArrayName="opciones" class="opciones-list">
            <div *ngFor="let opcion of opciones.controls; let i = index" [formGroupName]="i" class="opcion-item">
              <mat-form-field appearance="outline" class="opcion-texto">
                <mat-label>Texto opción {{ i + 1 }}</mat-label>
                <input matInput formControlName="texto" placeholder="Ej: Sí">
              </mat-form-field>

              <mat-form-field appearance="outline" class="opcion-puntos">
                <mat-label>Puntos</mat-label>
                <input matInput type="number" formControlName="valor" step="0.01">
              </mat-form-field>

              <button mat-icon-button type="button" (click)="eliminarOpcion(i)" color="warn" 
                      [disabled]="opciones.length <= 1">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>

          <button mat-stroked-button type="button" (click)="agregarOpcion()" class="add-opcion-btn">
            <mat-icon>add</mat-icon>
            Agregar Opción
          </button>
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
      gap: 16px;
      min-width: 600px;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      align-items: center;
    }
    .opciones-section {
      margin-top: 24px;
    }
    .opciones-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 16px 0 12px 0;
      h3 {
        margin: 0;
        font-size: 16px;
      }
    }
    .opciones-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 12px;
    }
    .opcion-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .opcion-texto {
      flex: 2;
    }
    .opcion-puntos {
      flex: 1;
      min-width: 120px;
    }
    .add-opcion-btn {
      width: 100%;
    }
    mat-dialog-content {
      padding: 20px 24px;
      max-height: 70vh;
      overflow-y: auto;
    }
  `]
})
export class PreguntaDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private preguntaService = inject(PreguntaService);
  private notificationService = inject(NotificationService);
  
  dialogRef = inject(MatDialogRef<PreguntaDialogComponent>);
  data = inject<{ pregunta?: Pregunta; segmentoId: number }>(MAT_DIALOG_DATA);

  form!: FormGroup;
  guardando = false;

  get opciones(): FormArray {
    return this.form.get('opciones') as FormArray;
  }

  ngOnInit(): void {
    const pregunta = this.data.pregunta;
    
    this.form = this.fb.group({
      texto: [pregunta?.texto || '', Validators.required],
      tipo: [pregunta?.tipo || 'si_no', Validators.required],
      peso: [pregunta?.peso || 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      orden: [pregunta?.orden || 1, [Validators.required, Validators.min(1)]],
      anula_segmento: [pregunta?.anula_segmento || false],
      comentario_requerido: [pregunta?.comentario_requerido || 'nunca'],
      opciones: this.fb.array([]),
    });

    // Si está editando, cargar opciones existentes
    if (pregunta?.opciones && pregunta.opciones.length > 0) {
      pregunta.opciones.forEach(opc => {
        this.opciones.push(this.fb.group({
          texto: [opc.texto, Validators.required],
          valor: [opc.valor, Validators.required],
          orden: [opc.orden || 1]
        }));
      });
    } else if (this.requiereOpciones()) {
      // Si es nuevo y requiere opciones, crear las predeterminadas
      this.crearOpcionesPredeterminadas();
    }
  }

  onTipoPreguntaChange(): void {
    // Limpiar opciones existentes
    while (this.opciones.length) {
      this.opciones.removeAt(0);
    }

    // Si el nuevo tipo requiere opciones, crear las predeterminadas
    if (this.requiereOpciones()) {
      this.crearOpcionesPredeterminadas();
    }
  }

  requiereOpciones(): boolean {
    const tipo = this.form.get('tipo')?.value;
    return ['si_no', 'opcion_multiple', 'checklist'].includes(tipo);
  }

  crearOpcionesPredeterminadas(): void {
    const tipo = this.form.get('tipo')?.value;
    
    if (tipo === 'si_no') {
      this.opciones.push(this.fb.group({
        texto: ['Sí', Validators.required],
        valor: [1, Validators.required],
        orden: [1]
      }));
      this.opciones.push(this.fb.group({
        texto: ['No', Validators.required],
        valor: [0, Validators.required],
        orden: [2]
      }));
    } else {
      // Para opcion_multiple y checklist, agregar una opción vacía
      this.agregarOpcion();
    }
  }

  agregarOpcion(): void {
    const orden = this.opciones.length + 1;
    this.opciones.push(this.fb.group({
      texto: ['', Validators.required],
      valor: [0, Validators.required],
      orden: [orden]
    }));
  }

  eliminarOpcion(index: number): void {
    this.opciones.removeAt(index);
    // Reordenar
    this.opciones.controls.forEach((control, i) => {
      control.get('orden')?.setValue(i + 1);
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.notificationService.showError('Por favor complete todos los campos requeridos');
      return;
    }

    // Validar que si requiere opciones, tenga al menos una
    if (this.requiereOpciones() && this.opciones.length === 0) {
      this.notificationService.showError('Debe agregar al menos una opción de respuesta');
      return;
    }

    this.guardando = true;
    const formValue = this.form.value;
    
    const dto: CreatePreguntaDto = {
      texto: formValue.texto,
      tipo: formValue.tipo,
      peso: formValue.peso,
      anula_segmento: formValue.anula_segmento,
      comentario_requerido: formValue.comentario_requerido,
      opciones: this.requiereOpciones() ? formValue.opciones : []
    };

    const request$ = this.data.pregunta
      ? this.preguntaService.updatePregunta(this.data.pregunta.id, dto)
      : this.preguntaService.createPregunta(this.data.segmentoId, dto);

    request$.subscribe({
      next: () => {
        this.notificationService.showSuccess(
          this.data.pregunta ? 'Pregunta actualizada' : 'Pregunta creada'
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
