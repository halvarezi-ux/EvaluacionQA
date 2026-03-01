// Re-export main types from core model
export type {
  Evaluacion,
  Respuesta,
  Area,
  Segmento,
  Pregunta,
  PreguntaOpcion,
  CreateEvaluacionDto,
  EvaluacionPaginatedResponse,
  TipoPregunta,
  TipoSegmento,
  ComentarioRequerido,
} from '../../core/models/boleta.model';

// ─── Tipos de nivel de calidad ────────────────────────────────────────────────
export type NivelEval = 'Excelente' | 'Bueno' | 'Regular' | 'Crítico';

// ─── Utilidades de UI ─────────────────────────────────────────────────────────

export function nivelColor(nivel: NivelEval | string): string {
  switch (nivel) {
    case 'Excelente': return '#10B981';
    case 'Bueno':     return '#3B82F6';
    case 'Regular':   return '#F59E0B';
    case 'Crítico':   return '#EF4444';
    default:          return '#6B7280';
  }
}

export function nivelClass(nivel: NivelEval | string): string {
  switch (nivel) {
    case 'Excelente': return 'nivel-excelente';
    case 'Bueno':     return 'nivel-bueno';
    case 'Regular':   return 'nivel-regular';
    case 'Crítico':   return 'nivel-critico';
    default:          return 'nivel-desconocido';
  }
}

export function scoreToNivel(score: number): NivelEval {
  if (score >= 90) return 'Excelente';
  if (score >= 75) return 'Bueno';
  if (score >= 60) return 'Regular';
  return 'Crítico';
}
