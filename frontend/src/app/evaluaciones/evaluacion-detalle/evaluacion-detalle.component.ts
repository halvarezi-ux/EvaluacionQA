import { Component, OnInit }  from '@angular/core';
import { CommonModule }        from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { MatTooltipModule }    from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EvaluacionService }   from '../services/evaluacion.service';
import { NotificationService } from '../../shared/services/notification.service';
import { Evaluacion, Respuesta, Segmento, nivelClass, nivelColor } from '../models/evaluacion.model';

@Component({
  selector:    'app-evaluacion-detalle',
  standalone:  true,
  imports: [
    CommonModule,
    MatButtonModule, MatIconModule,
    MatTooltipModule, MatProgressSpinnerModule,
  ],
  templateUrl: './evaluacion-detalle.component.html',
  styleUrls:   ['./evaluacion-detalle.component.css'],
})
export class EvaluacionDetalleComponent implements OnInit {
  evaluacion: Evaluacion | null = null;
  isLoading = true;

  nivelClass = nivelClass;
  nivelColor = nivelColor;

  constructor(
    private route:   ActivatedRoute,
    private router:  Router,
    private evalSvc: EvaluacionService,
    private notif:   NotificationService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.evalSvc.getEvaluacion(id).subscribe({
      next: e => { this.evaluacion = e; this.isLoading = false; },
      error: () => {
        this.notif.showError('Error al cargar la evaluación');
        this.isLoading = false;
      },
    });
  }

  volver(): void { this.router.navigate(['/evaluaciones']); }

  get segmentos(): Array<{ nombre: string; respuestas: Respuesta[] }> {
    if (!this.evaluacion?.respuestas) return [];
    const map = new Map<string, Respuesta[]>();
    for (const r of this.evaluacion.respuestas) {
      const segmentoNombre = r.pregunta?.segmento_nombre || 'Sin segmento';
      if (!map.has(segmentoNombre)) map.set(segmentoNombre, []);
      map.get(segmentoNombre)!.push(r);
    }
    return Array.from(map.entries()).map(([nombre, respuestas]) => ({ nombre, respuestas }));
  }

  scoreColor(nota: number): string {
    if (nota >= 90) return '#10B981';
    if (nota >= 75) return '#3B82F6';
    if (nota >= 60) return '#F59E0B';
    return '#EF4444';
  }
}
