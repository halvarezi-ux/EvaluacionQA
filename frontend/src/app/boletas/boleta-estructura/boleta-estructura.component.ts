import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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

interface TipoPreguntaOption {
  value: string;
  label: string;
  icon: string;
  description: string;
}

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
    DragDropModule,
  ],
  templateUrl: './boleta-estructura.component.html',
  styleUrls: ['./boleta-estructura.component.scss'],
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
  versionBorradorId: number | null = null;   // set when ?borrador=X query param present
  boleta: Boleta | null = null;
  versionActiva: BoletaVersion | null = null;
  segmentos: Segmento[] = [];
  loading = true;
  publicando = false;
  hasChanges = false;  // tracks if any edit was made in this borrador session

  /** Tracks which segment indices are expanded */
  expandedSegments = new Set<number>();

  /** Key = tipo+segmentoId while a quick-add API call is in flight */
  creatingTipo: string | null = null;

  readonly tiposPregunta: TipoPreguntaOption[] = [
    { value: 'si_no',           label: 'Sí / No',     icon: 'toggle_on',  description: 'Respuesta binaria Sí o No con puntaje configurable' },
    { value: 'opcion_multiple', label: 'Múltiple',    icon: 'list',       description: 'El evaluador elige una opción de la lista' },
    { value: 'porcentaje',      label: 'Porcentaje',  icon: 'percent',    description: 'Valor del 0 al 100% con slider' },
    { value: 'numerica',        label: 'Numérica',    icon: 'pin',        description: 'Ingreso de un valor numérico' },
    { value: 'checklist',       label: 'Checklist',   icon: 'checklist',  description: 'Selección de una opción de una lista checklist' },
    { value: 'texto_libre',     label: 'Texto libre', icon: 'notes',      description: 'Campo de texto libre para observaciones' },
  ];

  get canEdit(): boolean {
    // Borrador versions are always editable (no active evaluations)
    if (this.versionBorradorId) return true;
    return this.versionActiva?.es_editable ?? false;
  }

  get esBorrador(): boolean { return !!this.versionBorradorId; }

  ngOnInit(): void {
    this.boletaId = Number(this.route.snapshot.paramMap.get('id'));
    const borrador = this.route.snapshot.queryParamMap.get('borrador');
    this.versionBorradorId = borrador ? Number(borrador) : null;
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.boletaService.getBoleta(this.boletaId).subscribe({
      next: (boleta) => {
        this.boleta = boleta;
        if (this.versionBorradorId) {
          // Load the specific draft version for editing
          const version = boleta.versiones?.find(v => v.id === this.versionBorradorId);
          this.versionActiva = version ?? boleta.versiones?.find(v => v.es_activa) ?? null;
        } else {
          this.versionActiva = boleta.versiones?.find(v => v.es_activa) || null;
        }
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
        this.expandedSegments.clear();
        segmentos.forEach((_, i) => this.expandedSegments.add(i));
        this.loading = false;
      },
      error: () => {
        this.notificationService.showError('Error al cargar segmentos');
        this.loading = false;
      }
    });
  }

  crearSegmento(): void {
    const dialogRef = this.dialog.open(SegmentoDialogComponent, {
      width: '600px',
      data: { versionId: this.versionActiva!.id, pesoRestante: this.pesoRestante() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.hasChanges = true;
        this.cargarSegmentos();
      }
    });
  }

  editarSegmento(segmento: Segmento): void {
    // For editing, max = remaining + the segment's own current weight
    const maxParaEsteSegmento = this.pesoRestante() + Number(segmento.peso ?? 0);
    const dialogRef = this.dialog.open(SegmentoDialogComponent, {
      width: '600px',
      data: {
        segmento,
        versionId: this.versionActiva!.id,
        pesoRestante: maxParaEsteSegmento,
        ptsUsados: this.ptsUsados(segmento),
        totalGlobal: this.boleta?.total_global ?? 100,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.hasChanges = true;
        this.cargarSegmentos();
      }
    });
  }

  eliminarSegmento(segmento: Segmento): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar segmento',
        message: `¿Eliminar "${segmento.nombre}"? Se eliminarán también todas sus preguntas.`,
        confirmText: 'Eliminar',
      }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      // Optimistic: remove immediately from local array
      const idx = this.segmentos.findIndex(s => s.id === segmento.id);
      if (idx !== -1) this.segmentos.splice(idx, 1);
      this.segmentoService.deleteSegmento(segmento.id).subscribe({
        next: () => {
          this.hasChanges = true;
          this.notificationService.showSuccess('Segmento eliminado');
        },
        error: (err) => {
          // Rollback: re-insert at original position
          if (idx !== -1) this.segmentos.splice(idx, 0, segmento);
          this.notificationService.showError(err.error?.message ?? 'Error al eliminar');
        }
      });
    });
  }

  crearPregunta(segmento: Segmento): void {
    const dialogRef = this.dialog.open(PreguntaDialogComponent, {
      width: '700px',
      data: { segmentoId: segmento.id, ptsDisponibles: this.ptsRestantes(segmento), segmentoNombre: segmento.nombre }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.hasChanges = true;
        this.cargarSegmentos();
      }
    });
  }

  editarPregunta(segmento: Segmento, pregunta: Pregunta): void {
    // When editing, available = remaining + what this question already uses
    const disponibles = this.ptsRestantes(segmento) + this.ptsDePregunta(pregunta);
    const dialogRef = this.dialog.open(PreguntaDialogComponent, {
      width: '700px',
      data: { pregunta, segmentoId: segmento.id, ptsDisponibles: disponibles, segmentoNombre: segmento.nombre }
    });

    dialogRef.afterClosed().subscribe((result: Pregunta | undefined) => {
      if (!result) return;
      this.hasChanges = true;
      // Apply changes instantly to the local object — no full reload needed
      const idx = segmento.preguntas?.findIndex(p => p.id === result.id) ?? -1;
      if (idx !== -1) {
        segmento.preguntas![idx] = result;
      }
    });
  }

  eliminarPregunta(segmento: Segmento, pregunta: Pregunta): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar pregunta',
        message: `¿Eliminar la pregunta "${pregunta.texto}"?`,
        confirmText: 'Eliminar',
      }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      // Optimistic: remove immediately from local array
      const idx = segmento.preguntas?.findIndex(p => p.id === pregunta.id) ?? -1;
      if (idx !== -1) segmento.preguntas!.splice(idx, 1);
      this.preguntaService.deletePregunta(pregunta.id).subscribe({
        next: () => {
          this.hasChanges = true;
          this.notificationService.showSuccess('Pregunta eliminada');
        },
        error: (err) => {
          // Rollback: re-insert the question at its original position
          if (idx !== -1) segmento.preguntas!.splice(idx, 0, pregunta);
          this.notificationService.showError(err.error?.message ?? 'Error al eliminar');
        }
      });
    });
  }

  distribuirPesos(): void {
    const conPreguntas = this.segmentos.filter(s => s.preguntas && s.preguntas.length > 0);
    if (!conPreguntas.length) {
      this.notificationService.showError('No hay preguntas en los segmentos para distribuir');
      return;
    }
    forkJoin(conPreguntas.map(s => this.segmentoService.distribuirPesos(s.id))).subscribe({
      next: () => {
        this.notificationService.showSuccess('Pesos distribuidos equitativamente en todos los segmentos');
        this.cargarSegmentos();
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message ?? 'Error al distribuir');
      }
    });
  }

  // ── Expand / collapse ─────────────────────────────────────
  toggleSegmento(index: number): void {
    if (this.expandedSegments.has(index)) {
      this.expandedSegments.delete(index);
    } else {
      this.expandedSegments.add(index);
    }
  }

  // ── Publish draft version ──────────────────────────────────
  publicarVersion(): void {
    if (!this.versionBorradorId) return;
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Publicar versión borrador',
        message: `¿Publicar esta versión como la activa? La versión actual quedará desactivada (sus evaluaciones se conservan intactas).`,
        confirmText: 'Publicar',
      }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.publicando = true;
      this.boletaService.publicarVersionBorrador(this.boletaId, this.versionBorradorId!).subscribe({
        next: () => {
          this.notificationService.showSuccess('Versión publicada correctamente. Es ahora la versión activa.');
          // Reset draft state in-place (router reuses component on same route)
          this.versionBorradorId = null;
          this.publicando = false;
          // Remove ?borrador from URL without navigation
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true,
          });
          this.cargarDatos(); // reload fresh data without borrador
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message ?? 'Error al publicar');
          this.publicando = false;
        }
      });
    });
  }

  // ── Drag-and-drop ─────────────────────────────────────────
  onDropSegmento(event: CdkDragDrop<Segmento[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.hasChanges = true;
    moveItemInArray(this.segmentos, event.previousIndex, event.currentIndex);
    const updates = this.segmentos.map((s, i) =>
      this.segmentoService.updateSegmento(s.id, { nombre: s.nombre, tipo: s.tipo, peso: s.peso ?? undefined, penalizacion: s.penalizacion ?? undefined, orden: i + 1 })
    );
    forkJoin(updates).subscribe({
      error: () => this.notificationService.showError('Error al guardar el nuevo orden')
    });
  }

  onDropPregunta(segmento: Segmento, event: CdkDragDrop<Pregunta[]>): void {
    if (event.previousIndex === event.currentIndex || !segmento.preguntas) return;
    this.hasChanges = true;
    moveItemInArray(segmento.preguntas, event.previousIndex, event.currentIndex);
    const updates = segmento.preguntas.map((p, i) =>
      this.preguntaService.updatePregunta(p.id, { texto: p.texto, tipo: p.tipo, peso: p.peso ?? undefined, anula_segmento: p.anula_segmento, comentario_requerido: p.comentario_requerido, orden: i + 1 })
    );
    forkJoin(updates).subscribe({
      error: () => this.notificationService.showError('Error al guardar el nuevo orden')
    });
  }

  // ── Convenience aliases for external template ─────────────
  crearPreguntaEnSegmento(segmento: Segmento): void {
    this.crearPregunta(segmento);
  }

  /**
   * QUICK ADD — creates the question immediately with smart defaults.
   * Pushes directly into local array so UI updates instantly (no full reload).
   */
  crearPreguntaTipo(segmento: Segmento, tipo: string): void {
    if (!this.canEdit) return;

    const defaultsByTipo: Record<string, { texto: string; opciones: { texto: string; valor: number; orden: number }[] }> = {
      si_no:           { texto: 'Nueva pregunta',           opciones: [{ texto: 'Sí', valor: 1, orden: 1 }, { texto: 'No', valor: 0, orden: 2 }] },
      opcion_multiple: { texto: 'Nueva opción múltiple',    opciones: [{ texto: 'Opción A', valor: 1, orden: 1 }, { texto: 'Opción B', valor: 0, orden: 2 }] },
      porcentaje:      { texto: 'Puntuación (0–100%)',      opciones: [] },
      numerica:        { texto: 'Valor numérico',           opciones: [] },
      checklist:       { texto: 'Nueva checklist',          opciones: [{ texto: 'Criterio A', valor: 1, orden: 1 }, { texto: 'Criterio B', valor: 1, orden: 2 }] },
      texto_libre:     { texto: 'Comentario / observación', opciones: [] },
    };

    const def = defaultsByTipo[tipo] ?? { texto: 'Nueva pregunta', opciones: [] };
    // Block if segment is full and tipo costs pts
    if (this.tipoCostaPuntos(tipo) && this.segmentoLleno(segmento)) {
      this.notificationService.showError(
        `El segmento ya usa todos sus pts (${this.segmentoPts(segmento)} pts). Solo puedes agregar "Texto libre".`
      );
      return;
    }

    const key = tipo + '-' + segmento.id;
    this.creatingTipo = key;

    this.preguntaService.createPregunta(segmento.id, {
      texto: def.texto,
      tipo: tipo as any,
      comentario_requerido: 'nunca' as any,
      opciones: def.opciones,
    }).subscribe({
      next: (created) => {
        this.creatingTipo = null;
        this.hasChanges = true;
        // Push directly — no full reload, segment stays expanded
        if (!segmento.preguntas) segmento.preguntas = [];
        segmento.preguntas.push(created);
      },
      error: (err) => {
        this.creatingTipo = null;
        this.notificationService.showError(err.error?.message ?? 'Error al crear pregunta');
      }
    });
  }

  sumaPesos(): number {
    return this.segmentos.reduce((sum, s) => sum + Number(s.peso ?? 0), 0);
  }

  /** % weight still available for new segments (0 when full). */
  pesoRestante(): number {
    return Math.max(0, Math.round((100 - this.sumaPesos()) * 100) / 100);
  }

  // ── Pts capacity ─────────────────────────────────────────────
  /** Max pts the segment contributes to the boleta total. null for critico/resumen. */
  segmentoPts(seg: Segmento): number | null {
    if (seg.tipo !== 'normal' || seg.peso == null) return null;
    return Math.round((this.boleta?.total_global ?? 100) * seg.peso / 100 * 100) / 100;
  }

  /** Max pts a single question can contribute (max opcion.valor or pregunta.peso). */
  ptsDePregunta(p: Pregunta): number {
    if (p.peso != null) return Number(p.peso);
    if (p.opciones?.length) return Math.max(...p.opciones.map(o => Number(o.valor)));
    return 0;
  }

  /** Sum of pts already assigned to questions in the segment. */
  ptsUsados(seg: Segmento): number {
    return (seg.preguntas ?? []).reduce((sum, p) => sum + this.ptsDePregunta(p), 0);
  }

  /** Remaining pts available in this segment. */
  ptsRestantes(seg: Segmento): number {
    const total = this.segmentoPts(seg);
    if (total == null) return Infinity;
    return Math.max(0, Math.round((total - this.ptsUsados(seg)) * 100) / 100);
  }

  /** True when the segment has no more pts capacity for scored questions. */
  segmentoLleno(seg: Segmento): boolean {
    return seg.tipo === 'normal' && this.ptsRestantes(seg) === 0 && (this.segmentoPts(seg) ?? 0) > 0;
  }

  /** Only texto_libre has no pts. */
  tipoCostaPuntos(tipo: string): boolean {
    return tipo !== 'texto_libre';
  }

  volver(): void {
    if (this.esBorrador && !this.hasChanges && this.versionBorradorId) {
      // Discard the clone silently — no changes were made
      this.boletaService.descartarBorrador(this.boletaId, this.versionBorradorId).subscribe({
        next:  () => this.router.navigate(['/boletas']),
        error: () => this.router.navigate(['/boletas']),
      });
    } else {
      this.router.navigate(['/boletas']);
    }
  }
}
