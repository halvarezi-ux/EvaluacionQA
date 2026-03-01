import { Component, OnInit, OnDestroy }     from '@angular/core';
import { CommonModule }                       from '@angular/common';
import { Router }                             from '@angular/router';
import {
  FormBuilder, FormGroup, FormArray, FormControl,
  Validators, AbstractControl, ReactiveFormsModule
} from '@angular/forms';
import { MatButtonModule }                    from '@angular/material/button';
import { MatIconModule }                      from '@angular/material/icon';
import { MatFormFieldModule }                 from '@angular/material/form-field';
import { MatInputModule }                     from '@angular/material/input';
import { MatSelectModule }                    from '@angular/material/select';
import { MatSliderModule }                    from '@angular/material/slider';
import { MatTooltipModule }                   from '@angular/material/tooltip';
import { MatProgressSpinnerModule }           from '@angular/material/progress-spinner';
import { MatProgressBarModule }               from '@angular/material/progress-bar';
import { MatExpansionModule }                 from '@angular/material/expansion';
import { Subject }                            from 'rxjs';
import { takeUntil }                          from 'rxjs/operators';

import { BoletaService }      from '../../core/services/boleta.service';
import { AreaService }        from '../../core/services/area.service';
import { EvaluacionService }  from '../services/evaluacion.service';
import { NotificationService } from '../../shared/services/notification.service';
import {
  Boleta, BoletaVersion, Segmento, Pregunta, Area,
  CreateEvaluacionDto,
} from '../../core/models/boleta.model';
import { nivelClass, nivelColor, NivelEval } from '../models/evaluacion.model';

@Component({
  selector:    'app-evaluacion-nueva',
  standalone:  true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSliderModule,
    MatTooltipModule, MatProgressSpinnerModule,
    MatProgressBarModule, MatExpansionModule,
  ],
  templateUrl: './evaluacion-nueva.component.html',
  styleUrls:   ['./evaluacion-nueva.component.css'],
})
export class EvaluacionNuevaComponent implements OnInit, OnDestroy {
  // ── State ──────────────────────────────────────────
  isLoadingBoletas = false;
  isLoadingEstr    = false;
  isSaving         = false;

  boletas:    Boleta[]   = [];
  areas:      Area[]     = [];
  segmentos:  Segmento[] = [];
  preguntas:  Pregunta[] = [];   // flat list for form array alignment

  versionActiva: BoletaVersion | null = null;

  // Forms
  metaForm!:      FormGroup;
  respuestasArr!: FormArray;

  // Exposed helpers
  nivelClass = nivelClass;
  nivelColor = nivelColor;

  private destroy$ = new Subject<void>();

  constructor(
    private fb:        FormBuilder,
    private boletaSvc: BoletaService,
    private areaSvc:   AreaService,
    private evalSvc:   EvaluacionService,
    private notif:     NotificationService,
    private router:    Router,
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadBoletas();
    this.loadAreas();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Forms ───────────────────────────────────────────
  private buildForms(): void {
    this.respuestasArr = this.fb.array([]);
    this.metaForm = this.fb.group({
      boleta_id:    [null, Validators.required],
      area_id:      [null],
      agente_nombre: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  // ── Load data ──────────────────────────────────────
  loadBoletas(): void {
    this.isLoadingBoletas = true;
    this.boletaSvc.getBoletas({ estado: 'activa', per_page: 100 }).subscribe({
      next: res => {
        this.boletas = res.data ?? [];
        this.isLoadingBoletas = false;
      },
      error: () => {
        this.notif.showError('Error al cargar boletas');
        this.isLoadingBoletas = false;
      },
    });
  }

  loadAreas(): void {
    this.areaSvc.getAreas(true).subscribe({
      next: areas => { this.areas = areas; },
      error: () => { /* Areas are optional */ },
    });
  }

  onBoletaChange(boletaId: number | null): void {
    this.respuestasArr.clear();
    this.preguntas  = [];
    this.segmentos  = [];
    this.versionActiva = null;

    if (!boletaId) return;

    this.isLoadingEstr = true;
    this.boletaSvc.getBoleta(boletaId).subscribe({
      next: boleta => {
        this.versionActiva = boleta.versiones?.find(v => v.es_activa) ?? boleta.version_activa ?? null;
        if (this.versionActiva) {
          this.buildRespuestasFrom(this.versionActiva);
        }
        this.isLoadingEstr = false;
      },
      error: () => {
        this.notif.showError('Error al cargar estructura de la boleta');
        this.isLoadingEstr = false;
      },
    });
  }

  private buildRespuestasFrom(version: BoletaVersion): void {
    this.segmentos = version.segmentos ?? [];
    this.preguntas = [];

    this.segmentos.forEach(seg => {
      (seg.preguntas ?? []).forEach(preg => {
        this.preguntas.push(preg);
        this.respuestasArr.push(this.fb.group({
          pregunta_id:     [preg.id],
          respuesta_valor: [null, Validators.required],
          comentario:      [''],
        }));
      });
    });
  }

  // ── Form helpers ────────────────────────────────────
  respuestaAt(i: number): FormGroup {
    return this.respuestasArr.at(i) as FormGroup;
  }

  respuestaCtrl(i: number, field: string): FormControl {
    return this.respuestaAt(i).get(field) as FormControl;
  }

  setValor(i: number, val: string | number): void {
    this.respuestaAt(i).get('respuesta_valor')!.setValue(String(val));
  }

  getValor(i: number): string | null {
    return this.respuestaAt(i).get('respuesta_valor')?.value ?? null;
  }

  /** Returns the preguntas belonging to a given segmento for display grouping */
  preguntasDeSegmento(segmento: Segmento): Array<{ pregunta: Pregunta; index: number }> {
    return this.preguntas
      .map((p, i) => ({ pregunta: p, index: i }))
      .filter(({ pregunta }) => pregunta.segmento_id === segmento.id);
  }

  /** Comentario es requerido para esta pregunta */
  comentarioRequerido(pregunta: Pregunta): boolean {
    return ['siempre', 'si_es_no', 'si_es_si', 'si_penaliza'].includes(pregunta.comentario_requerido);
  }

  /** Encontrar índice en el FormArray para una pregunta específica */
  getPreguntaFormIndex(preguntaId: number): number {
    return this.respuestasArr.controls.findIndex(
      ctrl => ctrl.get('pregunta_id')?.value === preguntaId
    );
  }

  /** Obtener valor de respuesta de una pregunta */
  getRespuestaValue(preguntaId: number): any {
    const idx = this.getPreguntaFormIndex(preguntaId);
    if (idx === -1) return null;
    return this.respuestasArr.at(idx).get('respuesta_valor')?.value;
  }

  /** Establecer valor de respuesta */
  setRespuestaValue(preguntaId: number, valor: any): void {
    const idx = this.getPreguntaFormIndex(preguntaId);
    if (idx === -1) return;
    this.respuestasArr.at(idx).get('respuesta_valor')?.setValue(valor);
  }

  // ── Progress ────────────────────────────────────────
  get completadas(): number {
    return this.respuestasArr.controls.filter(c => c.get('respuesta_valor')?.value !== null).length;
  }
  get totalPreguntas(): number { return this.preguntas.length; }
  get progresoPct(): number {
    return this.totalPreguntas > 0 ? Math.round((this.completadas / this.totalPreguntas) * 100) : 0;
  }

  // ── Submit ───────────────────────────────────────────
  guardarEvaluacion(): void {
    if (this.metaForm.invalid || this.respuestasArr.invalid) {
      this.metaForm.markAllAsTouched();
      this.respuestasArr.controls.forEach(c => c.markAllAsTouched());
      return;
    }

    if (!this.versionActiva) {
      this.notif.showError('Selecciona una boleta primero');
      return;
    }

    const meta = this.metaForm.value;
    const dto: CreateEvaluacionDto = {
      boleta_version_id: this.versionActiva.id,
      area_id:           meta.area_id ?? undefined,
      agente_nombre:     meta.agente_nombre,
      respuestas:        this.respuestasArr.value.map((r: any) => ({
        pregunta_id:     r.pregunta_id,
        respuesta_valor: String(r.respuesta_valor),
        comentario:      r.comentario || undefined,
      })),
    };

    this.isSaving = true;
    this.evalSvc.crearEvaluacion(dto).subscribe({
      next: eval_ => {
        this.notif.showSuccess('Evaluación registrada correctamente');
        this.router.navigate(['/evaluaciones', eval_.id]);
      },
      error: () => {
        this.notif.showError('Error al guardar la evaluación');
        this.isSaving = false;
      },
    });
  }

  volver(): void { this.router.navigate(['/evaluaciones']); }

  getField(name: string): AbstractControl | null { return this.metaForm.get(name); }
  hasError(name: string, err: string): boolean {
    const c = this.getField(name);
    return !!(c && c.errors?.[err] && c.touched);
  }
}

