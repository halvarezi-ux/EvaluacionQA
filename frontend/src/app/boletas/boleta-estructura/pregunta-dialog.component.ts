import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PreguntaService } from '../../core/services/pregunta.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Pregunta, CreatePreguntaDto } from '../../core/models/boleta.model';

interface TipoBtn { value: string; label: string; icon: string; }

@Component({
  selector: 'app-pregunta-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatSlideToggleModule, MatIconModule, MatTooltipModule,
  ],
  template: `
    <div class="dlg-wrap">

      <!-- ── Header ──────────────────────── -->
      <div class="dlg-header">
        <mat-icon class="dlg-icon">quiz</mat-icon>
        <div class="dlg-titles">
          <h2 class="dlg-title">{{ data.pregunta ? 'Editar pregunta' : 'Nueva pregunta' }}</h2>
          <p class="dlg-sub">{{ tipoLabel }}</p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()" class="dlg-close"><mat-icon>close</mat-icon></button>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="form-body">

          <!-- Texto -->
          <mat-form-field appearance="outline" class="full">
            <mat-label>Texto de la pregunta *</mat-label>
            <textarea matInput formControlName="texto" rows="3"
                      placeholder="Ej: ¿El agente saludó correctamente al cliente?"></textarea>
            <mat-error *ngIf="form.get('texto')?.hasError('required')">El texto es requerido</mat-error>
          </mat-form-field>

          <!-- Tipo selector visual -->
          <div class="field-group">
            <label class="section-label">
              <mat-icon>category</mat-icon> Tipo de pregunta
            </label>
            <div class="tipo-grid">
              <button *ngFor="let t of tipos" type="button"
                      class="tipo-card"
                      [class.selected]="form.get('tipo')?.value === t.value"
                      [attr.data-tipo]="t.value"
                      (click)="setTipo(t.value)">
                <mat-icon>{{ t.icon }}</mat-icon>
                <span>{{ t.label }}</span>
              </button>
            </div>
            <div class="tipo-hint">{{ tipoHint }}</div>
          </div>

          <!-- Puntos -->
          <div class="field-group" *ngIf="form.get('tipo')?.value !== 'texto_libre'">
            <label class="section-label">
              <mat-icon>stars</mat-icon> Puntos de la pregunta
            </label>
            <div class="pts-row">
              <mat-form-field appearance="outline" class="pts-field">
                <mat-label>Puntos (pts)</mat-label>
                <input matInput type="number" formControlName="peso" min="0.01" step="0.01"
                       [max]="data.ptsDisponibles ?? 9999">
                <span matSuffix style="padding-right:8px;color:#6B7280;font-size:13px">pts</span>
                <mat-error></mat-error>
              </mat-form-field>
              <div class="pts-tip" *ngIf="data.ptsDisponibles != null">
                <mat-icon>bolt</mat-icon>
                <span>Disponible en el segmento <strong>{{ data.segmentoNombre ?? 'este segmento' }}</strong>: <strong>{{ ptsRestantesLive }} pts</strong></span>
              </div>
            </div>
            <div class="pts-error-chip"
                 *ngIf="form.get('peso')?.invalid && (form.get('peso')?.touched || form.get('peso')?.dirty)">
              <mat-icon>error_outline</mat-icon>
              <span>El valor debe estar entre <strong>0.01</strong> y <strong>{{ data.ptsDisponibles != null ? data.ptsDisponibles : 9999 }} pts</strong></span>
            </div>
          </div>

          <!-- Comentario requerido -->
          <mat-form-field appearance="outline" class="full">
            <mat-label>¿Cuándo pedir comentario al evaluador?</mat-label>
            <mat-select formControlName="comentario_requerido">
              <mat-option value="nunca">Nunca</mat-option>
              <mat-option value="siempre">Siempre</mat-option>
              <ng-container *ngIf="form.get('tipo')?.value === 'si_no'">
                <mat-option value="si_es_no">Solo si responde No</mat-option>
                <mat-option value="si_es_si">Solo si responde Sí</mat-option>
              </ng-container>
              <ng-container *ngIf="form.get('tipo')?.value === 'opcion_multiple'">
                <mat-option value="si_puntaje_cero">Solo si elige la opción incorrecta (0 pts)</mat-option>
              </ng-container>
            </mat-select>
          </mat-form-field>

          <!-- Anula segmento -->
          <div class="alert-toggle" *ngIf="form.get('tipo')?.value !== 'texto_libre'">
            <div class="alert-info">
              <span class="alert-title">Anula el segmento completo si falla</span>
              <span class="alert-desc">
                Si esta pregunta falla, todo el segmento queda en 0 puntos.
                Úsalo para criterios graves (ej: ¿Hubo insulto al cliente?).
              </span>
            </div>
            <mat-slide-toggle formControlName="anula_segmento" color="warn"></mat-slide-toggle>
          </div>

          <!-- Opciones -->
          <div class="opciones-section" *ngIf="tipoTieneOpciones">

            <div class="opciones-header">
              <label class="section-label">
                <mat-icon>list</mat-icon> Opciones de respuesta
              </label>
            </div>

            <div class="opc-nota" *ngIf="form.get('tipo')?.value === 'si_no'">
              Asigna los <strong>{{ form.get('peso')?.value > 0 ? form.get('peso')?.value + ' pts' : 'puntos' }}</strong>
              a la respuesta correcta (Sí o No) y <strong>0</strong> a la incorrecta.
            </div>
            <div class="opc-nota" [class.opc-nota-warn]="ptsPorAsignarMultiple !== 0"
                 *ngIf="form.get('tipo')?.value === 'opcion_multiple'">
              <ng-container *ngIf="form.get('peso')?.valid && form.get('peso')?.value > 0; else multiSinPts">
                Distribuye los <strong>{{ form.get('peso')?.value }} pts</strong> entre las opciones.
                <ng-container *ngIf="ptsPorAsignarMultiple > 0">
                  Faltan <strong>{{ ptsPorAsignarMultiple }} pts</strong> por asignar.
                </ng-container>
                <ng-container *ngIf="ptsPorAsignarMultiple < 0">
                  ⚠️ Te excediste por <strong>{{ ptsPorAsignarMultiple * -1 }} pts</strong>. Ajusta las opciones.
                </ng-container>
                <ng-container *ngIf="ptsPorAsignarMultiple === 0">
                  ✅ Los puntos están distribuidos correctamente.
                </ng-container>
              </ng-container>
              <ng-template #multiSinPts>
                Ingresa los puntos en <strong>"PUNTOS DE LA PREGUNTA"</strong> para ver la distribución.
              </ng-template>
            </div>

            <!-- Modo de selección (solo opcion_multiple) -->
            <div class="sel-mode-wrap" *ngIf="form.get('tipo')?.value === 'opcion_multiple'">
              <label class="section-label"><mat-icon>tune</mat-icon> Modo de selección</label>
              <div class="sel-mode-btns">
                <button type="button" class="sel-mode-btn"
                        [class.active]="!esMultiselect"
                        (click)="setMaxSelecciones(1)">
                  <mat-icon>radio_button_checked</mat-icon> Solo una opción
                </button>
                <button type="button" class="sel-mode-btn"
                        [class.active]="esMultiselect"
                        (click)="setMaxSelecciones(0)">
                  <mat-icon>check_box</mat-icon> Varias opciones
                </button>
              </div>
              <div class="max-sel-row" *ngIf="esMultiselect">
                <mat-form-field appearance="outline" class="max-sel-field">
                  <mat-label>Máximo de selecciones</mat-label>
                  <input matInput type="number" formControlName="max_selecciones" min="0" step="1"
                         [max]="maxOpcionesCount"
                         placeholder="Ej: 2"
                         (change)="clampMaxSelecciones()">
                  <mat-hint>Ej: 0 = sin límite · 2 = hasta 2 opciones (máx: {{ maxOpcionesCount }})</mat-hint>
                </mat-form-field>
              </div>
            </div>
            <div class="opc-nota" *ngIf="form.get('tipo')?.value === 'checklist'">
              El evaluador marca todas las que apliquen. Los puntos se suman.
            </div>

            <div class="opc-list">
              <div class="opc-row" *ngFor="let opc of opciones.controls; let i = index"
                   [formGroup]="opcGrp(i)">
                <div class="opc-badge">{{ i + 1 }}</div>
                <mat-form-field appearance="outline" class="opc-texto">
                  <mat-label>Opción {{ i + 1 }}</mat-label>
                  <input matInput formControlName="texto" placeholder="Ej: Sí">
                  <mat-error>Requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline" class="opc-pts">
                  <mat-label>Puntos</mat-label>
                  <input matInput type="number" formControlName="valor" min="0" step="0.01">
                  <mat-error>Requerido</mat-error>
                </mat-form-field>
                <button type="button" mat-icon-button color="warn"
                        [disabled]="opciones.length <= minOpciones || form.get('tipo')?.value === 'si_no'"
                        (click)="quitarOpcion(i)" matTooltip="Eliminar opción">
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </div>
            </div>

            <!-- Botón agregar opción -->
            <button type="button" class="add-opcion-btn"
                    *ngIf="form.get('tipo')?.value !== 'si_no'"
                    (click)="agregarOpcion()">
              <mat-icon>add_circle_outline</mat-icon>
              <span>Agregar opción</span>
            </button>
          </div>

        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">Cancelar</button>
        <button mat-raised-button color="primary"
                (click)="guardar()" [disabled]="form.invalid || guardando || !maxSelValid">
          <mat-icon>save</mat-icon>
          {{ guardando ? 'Guardando...' : 'Guardar pregunta' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dlg-wrap { display: flex; flex-direction: column; }

    .dlg-header {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 20px 24px 16px;
      border-bottom: 1px solid #E5E7EB;
    }
    .dlg-icon { font-size: 28px; width: 28px; height: 28px; color: #4F46E5; margin-top: 3px; }
    .dlg-titles { flex: 1; }
    .dlg-title { margin: 0; font-size: 18px; font-weight: 700; color: #1E1B4B; }
    .dlg-sub { margin: 3px 0 0; font-size: 13px; color: #6B7280; }
    .dlg-close { flex-shrink: 0; }

    mat-dialog-content { padding: 20px 24px 8px !important; max-height: 62vh; }

    .form-body { display: flex; flex-direction: column; gap: 18px; min-width: 560px; }

    .full { width: 100%; }

    .field-group { display: flex; flex-direction: column; gap: 8px; }

    .section-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .5px; color: #4F46E5;
    }
    .section-label mat-icon { font-size: 15px; width: 15px; height: 15px; }

    .tipo-grid { display: flex; gap: 8px; flex-wrap: wrap; }

    .tipo-card {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: 10px; cursor: pointer;
      font-size: 13px; font-weight: 600;
      border: 2px solid #E5E7EB; background: #fff; color: #6B7280;
      transition: all .15s;
    }
    .tipo-card mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .tipo-card:hover { border-color: #4F46E5; color: #4F46E5; background: #EEF0FF; }

    .tipo-card[data-tipo="si_no"].selected           { border-color: #10B981; color: #065F46; background: #D1FAE5; }
    .tipo-card[data-tipo="opcion_multiple"].selected  { border-color: #3B82F6; color: #1D4ED8; background: #DBEAFE; }
    .tipo-card[data-tipo="porcentaje"].selected       { border-color: #F59E0B; color: #92400E; background: #FEF9C3; }
    .tipo-card[data-tipo="numerica"].selected         { border-color: #8B5CF6; color: #5B21B6; background: #EDE9FE; }
    .tipo-card[data-tipo="checklist"].selected        { border-color: #EF4444; color: #991B1B; background: #FEE2E2; }
    .tipo-card[data-tipo="texto_libre"].selected      { border-color: #6B7280; color: #374151; background: #F3F4F6; }

    .tipo-hint {
      font-size: 12px; color: #6B7280; font-style: italic;
      padding: 6px 10px; background: #F8F9FF; border-radius: 6px; min-height: 30px;
    }

    .peso-row { display: grid; grid-template-columns: 160px 1fr; gap: 16px; align-items: flex-start; }
    .pts-row { display: grid; grid-template-columns: 160px 1fr; gap: 16px; align-items: flex-start; }
    .pts-field { width: 100%; }
    .pts-tip {
      display: flex; gap: 8px; align-items: flex-start;
      padding: 10px 12px; background: #EFF6FF; border: 1px solid #BFDBFE;
      border-radius: 8px; font-size: 12px; color: #1D4ED8; line-height: 1.5;
    }
    .pts-tip mat-icon { font-size: 16px; width: 16px; height: 16px; flex-shrink: 0; margin-top: 1px; color: #3B82F6; }
    .pts-tip strong { color: #1E40AF; }

    .pts-error-chip {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 9px 14px; background: #FEF2F2;
      border: 1.5px solid #FECACA; border-radius: 8px;
      font-size: 13px; color: #B91C1C; font-weight: 600;
      align-self: flex-start;
    }
    .pts-error-chip mat-icon { font-size: 18px; width: 18px; height: 18px; color: #EF4444; flex-shrink: 0; }
    .pts-error-chip strong { color: #991B1B; font-weight: 800; font-style: normal; }

    .alert-toggle {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
      padding: 12px 14px; background: #FFF8F0;
      border: 1px solid #FDE68A; border-radius: 10px;
    }
    .alert-title { display: block; font-size: 13px; font-weight: 700; color: #B45309; }
    .alert-desc { display: block; font-size: 12px; color: #78350F; margin-top: 4px; line-height: 1.5; max-width: 400px; }

    .opciones-section {
      padding: 14px; background: #F8FAFF;
      border: 1.5px solid #C7D2FE; border-radius: 10px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .opciones-header { display: flex; align-items: center; justify-content: space-between; }
    .opc-nota { font-size: 12px; color: #4F46E5; font-style: italic; line-height: 1.6; }
    .opc-nota strong { font-style: normal; font-weight: 700; color: #3730A3; }
    .opc-nota-warn { color: #B45309; }
    .opc-nota-warn strong { color: #92400E; }
    .opc-list { display: flex; flex-direction: column; gap: 8px; }
    .add-opcion-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 11px 20px;
      background: #F5F3FF;
      border: 1.5px dashed #818CF8;
      border-radius: 10px;
      color: #4F46E5; font-size: 13px; font-weight: 600; letter-spacing: 0.01em;
      cursor: pointer;
      transition: background 0.18s, border-color 0.18s, color 0.18s, box-shadow 0.18s;
      box-shadow: 0 1px 3px rgba(99,102,241,0.07);
    }
    .add-opcion-btn mat-icon {
      font-size: 19px; width: 19px; height: 19px;
      background: #EDE9FE; border-radius: 50%; padding: 2px;
      transition: background 0.18s;
    }
    .add-opcion-btn:hover {
      background: #EDE9FE; border-color: #4F46E5; color: #3730A3;
      box-shadow: 0 2px 8px rgba(99,102,241,0.15);
    }
    .add-opcion-btn:hover mat-icon { background: #C7D2FE; }
    .add-opcion-btn:active { background: #DDD6FE; border-color: #3730A3; }
    .opc-row { display: flex; align-items: center; gap: 8px; }
    .opc-row-readonly .mat-mdc-form-field { opacity: 1; }
    .opc-row-readonly .mat-mdc-form-field .mdc-text-field { background: #F3F4F6 !important; }
    .opc-row-readonly .mat-mdc-form-field input { color: #374151 !important; cursor: default; }
    .opc-badge {
      width: 24px; height: 24px; border-radius: 50%;
      background: #4F46E5; color: #fff; font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .opc-texto { flex: 1; }
    .opc-pts { width: 110px; flex-shrink: 0; }

    .sel-mode-wrap { display: flex; flex-direction: column; gap: 8px; padding: 10px 0 4px; border-top: 1px dashed #C7D2FE; }
    .sel-mode-btns { display: flex; gap: 8px; }
    .sel-mode-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: 8px; cursor: pointer;
      font-size: 13px; font-weight: 600;
      border: 2px solid #E5E7EB; background: #fff; color: #6B7280;
      transition: all .15s;
    }
    .sel-mode-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .sel-mode-btn:hover { border-color: #3B82F6; color: #3B82F6; background: #EFF6FF; }
    .sel-mode-btn.active { border-color: #3B82F6; color: #1D4ED8; background: #DBEAFE; }
    .max-sel-row { max-width: 280px; padding-bottom: 20px; }
    .max-sel-field { width: 100%; }

    mat-dialog-actions { padding: 12px 24px 16px !important; border-top: 1px solid #E5E7EB; gap: 8px; }
  `]
})
export class PreguntaDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private preguntaService = inject(PreguntaService);
  private notificationService = inject(NotificationService);

  dialogRef = inject(MatDialogRef<PreguntaDialogComponent>);
  data = inject<{ pregunta?: Pregunta; segmentoId: number; tipoInicial?: string; ptsDisponibles?: number; segmentoNombre?: string }>(MAT_DIALOG_DATA);

  form!: FormGroup;
  guardando = false;
  modoMultiselect = false;  // controla si el modo varias-opciones está activo (independiente del valor del campo)

  readonly tipos: TipoBtn[] = [
    { value: 'si_no',           label: 'Sí / No',     icon: 'toggle_on'  },
    { value: 'opcion_multiple', label: 'Múltiple',    icon: 'list'       },
    { value: 'porcentaje',      label: 'Porcentaje',  icon: 'percent'    },
    { value: 'numerica',        label: 'Numérica',    icon: 'pin'        },
    { value: 'checklist',       label: 'Checklist',   icon: 'checklist'  },
    { value: 'texto_libre',     label: 'Texto libre', icon: 'notes'      },
  ];

  private readonly hints: Record<string, string> = {
    si_no:           'El evaluador responde Sí o No. Define en qué respuesta se obtendrán los puntos abajo.',
    opcion_multiple: 'El evaluador elige UNA opción o Varias. Distribuye los pts de la pregunta entre las opciones — la suma debe ser exacta.',
    porcentaje:      'El evaluador ingresa un valor del 0 al 100%. Se calcula proporcionalmente al peso.',
    numerica:        'El evaluador ingresa un número. Configura el rango de puntos en las opciones.',
    checklist:       'El evaluador marca TODAS las que apliquen. Los puntos de cada criterio marcado se suman.',
    texto_libre:     'Campo de observaciones libre. No suma puntos a la nota final.',
  };

  get tipoLabel(): string {
    return this.tipos.find(t => t.value === this.form?.get('tipo')?.value)?.label ?? '';
  }

  get tipoHint(): string {
    const tipo = this.form?.get('tipo')?.value;
    if (tipo === 'opcion_multiple') {
      const max = this.form?.get('max_selecciones')?.value ?? 1;
      if (max === 1) return 'El evaluador elige UNA opción o Varias. Distribuye los pts de la pregunta entre las opciones — la suma debe ser exacta.';
      const maxLabel = max === 0 ? 'todas las que quiera' : `hasta ${max} opciones`;
      return `El evaluador puede elegir ${maxLabel}. Los pts de cada opción seleccionada se suman.`;
    }
    return this.hints[tipo] ?? '';
  }

  get tipoTieneOpciones(): boolean {
    return ['si_no', 'opcion_multiple', 'checklist'].includes(this.form?.get('tipo')?.value);
  }

  get minOpciones(): number {
    return ['opcion_multiple', 'checklist'].includes(this.form?.get('tipo')?.value) ? 2 : 1;
  }

  /** True when opcion_multiple is in multiselect mode (max_selecciones ≠ 1). */
  get esMultiselect(): boolean {
    return this.form?.get('tipo')?.value === 'opcion_multiple' && this.modoMultiselect;
  }

  /** Upper bound for max_selecciones: cannot exceed the number of available options. */
  get maxOpcionesCount(): number {
    return this.opciones?.length ?? 2;
  }

  /** Pts remaining in the segment after accounting for what the user has typed in the peso field. */
  get ptsRestantesLive(): number {
    const disponibles = this.data.ptsDisponibles ?? 0;
    const pesoIngresado = Number(this.form?.get('peso')?.value ?? 0);
    return Math.max(0, Math.round((disponibles - pesoIngresado) * 100) / 100);
  }

  /** Sum of all opcion valores for opcion_multiple (live, for display). */
  get sumaOpcionesMultiple(): number {
    if (this.form?.get('tipo')?.value !== 'opcion_multiple') return 0;
    return Math.round(
      (this.opciones.controls as FormGroup[])
        .reduce((sum, grp) => sum + Number(grp.get('valor')?.value ?? 0), 0) * 100
    ) / 100;
  }

  /** Pts still to distribute across opcion_multiple options. */
  get ptsPorAsignarMultiple(): number {
    const peso = Number(this.form?.get('peso')?.value ?? 0);
    return Math.round((peso - this.sumaOpcionesMultiple) * 100) / 100;
  }

  /** False when "Varias opciones" is active but max_selecciones has no committed value. */
  get maxSelValid(): boolean {
    if (!this.esMultiselect) return true;
    const val = this.form.get('max_selecciones')?.value;
    return val !== null && val !== undefined && val !== '';
  }

  get opciones(): FormArray {
    return this.form.get('opciones') as FormArray;
  }

  ngOnInit(): void {
    const p = this.data.pregunta;
    const tipo = p?.tipo ?? this.data.tipoInicial ?? 'si_no';

    this.form = this.fb.group({
      texto:                [p?.texto ?? '',    [Validators.required, Validators.maxLength(1000)]],
      tipo:                 [tipo,               Validators.required],
      peso:                 [p?.peso ?? null,    [Validators.min(0.01), Validators.max(this.data.ptsDisponibles ?? 9999)]],
      anula_segmento:       [p?.anula_segmento ?? false],
      comentario_requerido: [p?.comentario_requerido ?? 'nunca'],
      max_selecciones:      [p?.max_selecciones ?? 1],
      opciones:             this.fb.array([]),
    });

    // Restaurar modo multiselect si se está editando una pregunta existente
    this.modoMultiselect = tipo === 'opcion_multiple' && (p?.max_selecciones ?? 1) !== 1;

    if (p?.opciones?.length) {
      p.opciones.forEach(o => this.pushOpcion(o.texto, o.valor));
      // For existing si_no, lock the texto labels (Sí/No) but keep valor editable
      if (tipo === 'si_no') {
        (this.opciones.controls as FormGroup[]).forEach(grp =>
          grp.get('texto')?.disable({ emitEvent: false })
        );
      }
    } else if (!p) {
      this.seedOpciones(tipo);
    }

    // Auto-sync si_no: when peso changes, put pts on Si and 0 on No (user can still edit)
    this.form.get('peso')!.valueChanges.subscribe(pesoVal => {
      if (this.form.get('tipo')?.value !== 'si_no') return;
      this.syncSiNoOpciones(pesoVal);
    });
  }

  setTipo(valor: string): void {
    if (this.form.get('tipo')?.value === valor) return;
    // Reset max_selecciones to single when leaving opcion_multiple
    if (valor !== 'opcion_multiple') {
      this.form.patchValue({ max_selecciones: 1 });
      this.modoMultiselect = false;
    }
    // Reset comentario if incompatible with new tipo
    const comentarioActual = this.form.get('comentario_requerido')?.value;
    if (valor !== 'si_no' && ['si_es_no', 'si_es_si'].includes(comentarioActual)) {
      this.form.patchValue({ comentario_requerido: 'nunca' });
    }
    if (valor !== 'opcion_multiple' && comentarioActual === 'si_puntaje_cero') {
      this.form.patchValue({ comentario_requerido: 'nunca' });
    }
    this.form.patchValue({ tipo: valor });
    this.opciones.clear();
    this.seedOpciones(valor);
    if (valor === 'si_no') {
      this.syncSiNoOpciones(this.form.get('peso')?.value);
    }
  }

  /** Switch opcion_multiple entre modo radio (1) y modo multiselect (varias opciones). */
  setMaxSelecciones(val: number): void {
    if (val === 1) {
      // Volver a solo una opción
      this.modoMultiselect = false;
      this.form.patchValue({ max_selecciones: 1 });
    } else {
      // Activar modo varias opciones; limpiar el campo para que el usuario escriba la cantidad
      this.modoMultiselect = true;
      const actual = this.form.get('max_selecciones')?.value;
      if (actual === 1 || actual == null) {
        this.form.patchValue({ max_selecciones: null });
      }
    }
  }

  /** Clamp max_selecciones so it never exceeds the number of opciones (0 = unlimited, skip clamp). */
  clampMaxSelecciones(): void {
    const ctrl = this.form.get('max_selecciones');
    if (!ctrl) return;
    const val = Number(ctrl.value ?? 0);
    // Si el usuario escribe 1 y confirma (blur/enter), volver a "Solo una opción"
    if (val === 1) {
      this.setMaxSelecciones(1);
      return;
    }
    if (val > 0 && val > this.maxOpcionesCount) {
      ctrl.setValue(this.maxOpcionesCount, { emitEvent: false });
    }
  }

  /** Set si_no opcion values: index 0 = pts (Si), rest = 0. Null when no peso. */
  private syncSiNoOpciones(pesoVal: any): void {
    const pts = (pesoVal != null && Number(pesoVal) > 0) ? Number(pesoVal) : null;
    const ctrls = this.opciones.controls as FormGroup[];
    if (!ctrls.length) return;
    ctrls[0].get('valor')?.setValue(pts, { emitEvent: false });
    ctrls.slice(1).forEach(grp => grp.get('valor')?.setValue(pts != null ? 0 : null, { emitEvent: false }));
  }

  private seedOpciones(tipo: string): void {
    const pesoActual = this.form?.get('peso')?.value;
    const hasPeso = pesoActual != null && Number(pesoActual) > 0;
    if (tipo === 'si_no') {
      this.pushOpcion('Sí', hasPeso ? Number(pesoActual) : null);
      this.pushOpcion('No', hasPeso ? 0 : null);
    }
    else if (tipo === 'opcion_multiple') { this.pushOpcion('Opción A', 0); this.pushOpcion('Opción B', 0); }
    else if (tipo === 'checklist')       { this.pushOpcion('Criterio A', 1); this.pushOpcion('Criterio B', 1); }
  }

  agregarOpcion(): void { this.pushOpcion('', 0); }

  private pushOpcion(texto: string, valor: number | null): void {
    const isSiNo = this.form?.get('tipo')?.value === 'si_no';
    const grp = this.fb.group({
      texto: [texto, Validators.required],
      valor: [null as number | null, isSiNo ? [] : [Validators.required, Validators.min(0)]],
    });
    // Asignar el valor explícitamente después de crear el grupo para forzar render correcto
    grp.get('valor')?.setValue(valor, { emitEvent: false });
    // si_no: lock only the label (texto); valor stays editable
    if (isSiNo) {
      grp.get('texto')?.disable({ emitEvent: false });
    } else {
      grp.get('valor')!.valueChanges.subscribe(val => {
        if (this.form?.get('tipo')?.value !== 'si_no') return;
        const v = Number(val ?? 0);
        if (v <= 0) return;
        const idx = this.opciones.controls.indexOf(grp);
        (this.opciones.controls as FormGroup[]).forEach((g, i) => {
          if (i !== idx) g.patchValue({ valor: 0 }, { emitEvent: false });
        });
      });
    }
    this.opciones.push(grp);
  }

  quitarOpcion(i: number): void {
    this.opciones.removeAt(i);
    // Re-clamp max_selecciones if it now exceeds the reduced option count
    this.clampMaxSelecciones();
  }

  opcGrp(i: number): FormGroup { return this.opciones.at(i) as FormGroup; }

  guardar(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();  // getRawValue includes disabled controls

    // si_no validation: exactly ONE opcion must equal peso, ALL others must be 0
    if (raw.tipo === 'si_no' && raw.peso != null && raw.peso > 0) {
      const vals = raw.opciones.map((o: any) => Number(o.valor ?? 0));
      const correctas = vals.filter((v: number) => v === Number(raw.peso));
      const incorrectas = vals.filter((v: number) => v !== Number(raw.peso));
      const todasIncorrectasCero = incorrectas.every((v: number) => v === 0);

      if (correctas.length !== 1 || !todasIncorrectasCero) {
        this.notificationService.showError(
          `Debes asignar exactamente ${raw.peso} pts a UNA sola respuesta y 0 a la incorrecta.`
        );
        return;
      }
    }

    // opcion_multiple: max_selecciones no puede superar la cantidad de opciones (0 = ilimitado, se omite la validación)
    if (raw.tipo === 'opcion_multiple') {
      const maxSel = this.modoMultiselect ? (Number(raw.max_selecciones) || 0) : 1;
      if (maxSel > 0 && maxSel > raw.opciones.length) {
        this.notificationService.showError(
          `El máximo de selecciones (${maxSel}) no puede superar la cantidad de opciones (${raw.opciones.length}).`
        );
        return;
      }
    }

    // opcion_multiple validation: sum of all opciones must equal peso exactly
    if (raw.tipo === 'opcion_multiple' && raw.peso != null && raw.peso > 0) {
      const suma = raw.opciones.reduce((s: number, o: any) => s + Number(o.valor ?? 0), 0);
      const suma100 = Math.round(suma * 100) / 100;
      if (suma100 !== Number(raw.peso)) {
        this.notificationService.showError(
          `La suma de puntos de las opciones debe ser exactamente ${raw.peso} pts. ` +
          `Actualmente suman ${suma100} pts.`
        );
        return;
      }
    }

    this.guardando = true;

    const dto: CreatePreguntaDto = {
      texto:                raw.texto,
      tipo:                 raw.tipo,
      peso:                 raw.peso ?? undefined,
      anula_segmento:       raw.anula_segmento,
      comentario_requerido: raw.comentario_requerido,
      max_selecciones:      raw.tipo === 'opcion_multiple'
                              ? (this.modoMultiselect ? (Number(raw.max_selecciones) || 0) : 1)
                              : undefined,
      opciones: raw.opciones.map((o: any, i: number) => ({ texto: o.texto, valor: o.valor, orden: i + 1 })),
    };

    const req$ = this.data.pregunta
      ? this.preguntaService.updatePregunta(this.data.pregunta.id, dto)
      : this.preguntaService.createPregunta(this.data.segmentoId, dto);

    req$.subscribe({
      next: (result) => {
        this.notificationService.showSuccess(this.data.pregunta ? 'Pregunta actualizada' : 'Pregunta creada');
        this.dialogRef.close(result);
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message ?? 'Error al guardar');
        this.guardando = false;
      },
    });
  }
}
