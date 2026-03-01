import { Component, OnInit }      from '@angular/core';
import { CommonModule }            from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder, FormGroup,
  Validators, ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule }       from '@angular/material/form-field';
import { MatInputModule }           from '@angular/material/input';
import { MatButtonModule }          from '@angular/material/button';
import { MatSelectModule }          from '@angular/material/select';
import { MatIconModule }            from '@angular/material/icon';
import { MatCardModule }            from '@angular/material/card';
import { MatSlideToggleModule }     from '@angular/material/slide-toggle';
import { MatDividerModule }         from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule }         from '@angular/material/tooltip';

import { BoletaService }        from '../../core/services/boleta.service';
import { NotificationService }  from '../../shared/services/notification.service';
import { Boleta, CreateBoletaDto } from '../../core/models/boleta.model';

@Component({
  selector: 'app-boleta-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatIconModule, MatCardModule,
    MatSlideToggleModule, MatDividerModule, MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './boleta-form.component.html',
  styleUrls:   ['./boleta-form.component.css'],
})
export class BoletaFormComponent implements OnInit {
  metaForm!: FormGroup;

  boletaId:  number | null = null;
  boleta:    Boleta | null = null;
  isEditMode = false;
  isReadOnly = false;
  isLoading  = false;
  isSaving   = false;

  constructor(
    private fb:                  FormBuilder,
    private boletaService:       BoletaService,
    private notificationService: NotificationService,
    private router:              Router,
    private route:               ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.boletaId   = +id;
      this.loadBoleta();
    }
  }

  // ─── Init ────────────────────────────────────────────────────────
  private initForm(): void {
    this.metaForm = this.fb.group({
      nombre:           ['', [Validators.required, Validators.maxLength(255)]],
      descripcion:      [null],
      pais:             [null, Validators.maxLength(100)],
      cliente:          [null, Validators.maxLength(255)],
      tipo_interaccion: [null],
      total_global:     [100, [Validators.min(1), Validators.max(1000)]],
    });
  }

  // ─── Carga ───────────────────────────────────────────────────────
  private loadBoleta(): void {
    if (!this.boletaId) return;
    this.isLoading = true;

    this.boletaService.getBoleta(this.boletaId).subscribe({
      next: boleta => {
        this.boleta    = boleta;
        this.isReadOnly = !boleta.es_editable;

        this.metaForm.patchValue({
          nombre:           boleta.nombre,
          descripcion:      boleta.descripcion,
          pais:             boleta.pais,
          cliente:          boleta.cliente,
          tipo_interaccion: boleta.tipo_interaccion,
          total_global:     boleta.total_global,
        });

        if (this.isReadOnly) this.metaForm.disable();
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.showError('Error al cargar la boleta');
        this.isLoading = false;
        this.router.navigate(['/boletas']);
      },
    });
  }

  // ─── Guardar metadatos ────────────────────────────────────────────
  guardarMeta(): void {
    if (this.metaForm.invalid) { this.metaForm.markAllAsTouched(); return; }
    this.isSaving = true;
    const dto = this.metaForm.value as CreateBoletaDto;

    const obs = this.isEditMode && this.boletaId
      ? this.boletaService.updateBoleta(this.boletaId, dto)
      : this.boletaService.createBoleta(dto);

    obs.subscribe({
      next: boleta => {
        this.boletaId   = boleta.id;
        this.boleta     = boleta;
        this.isEditMode = true;
        this.isSaving   = false;
        this.notificationService.showSuccess(
          this.route.snapshot.paramMap.get('id')
            ? 'Boleta actualizada correctamente'
            : 'Boleta creada — ahora configura los segmentos y preguntas'
        );
        if (!this.route.snapshot.paramMap.get('id')) {
          this.router.navigate(['/boletas/editar', boleta.id]);
        }
      },
      error: err => {
        this.notificationService.showError(err.error?.message ?? 'Error al guardar');
        this.isSaving = false;
      },
    });
  }

  // ─── Helpers de estado ────────────────────────────────────────────
  get estadoLabel(): string { return this.boleta?.estado_label ?? ''; }
  get puedeActivar(): boolean { return this.boleta?.es_editable === true; }

  irAEstructura(): void {
    if (this.boletaId) {
      this.router.navigate(['/boletas', this.boletaId, 'estructura']);
    }
  }

  activar(): void {
    if (!this.boletaId) return;
    this.boletaService.activarBoleta(this.boletaId).subscribe({
      next: b => {
        this.boleta    = b;
        this.isReadOnly = !b.es_editable;
        if (this.isReadOnly) this.metaForm.disable();
        this.notificationService.showSuccess('Boleta activada — ya está disponible para evaluaciones');
      },
      error: err => this.notificationService.showError(err.error?.message ?? 'Error al activar'),
    });
  }

  archivar(): void {
    if (!this.boletaId) return;
    this.boletaService.archivarBoleta(this.boletaId).subscribe({
      next: () => this.router.navigate(['/boletas']),
      error: err => this.notificationService.showError(err.error?.message ?? 'Error al archivar'),
    });
  }

  volver(): void { this.router.navigate(['/boletas']); }
}
