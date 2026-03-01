// ─── Tipos y Enums ────────────────────────────────────────────────────────────
export type TipoInteraccion     = 'llamada' | 'chat' | 'email';
export type EstadoBoleta        = 'draft' | 'activa' | 'archivada';
export type TipoSegmento        = 'normal' | 'critico' | 'resumen';
export type TipoPregunta        = 'si_no' | 'opcion_multiple' | 'porcentaje' | 'numerica' | 'checklist' | 'texto_libre';
export type ComentarioRequerido = 'nunca' | 'siempre' | 'si_es_no' | 'si_es_si' | 'si_penaliza';

// ─── Modelos principales ───────────────────────────────────────────────────────
export interface Area {
  id:     number;
  nombre: string;
  activa: boolean;
}

export interface Boleta {
  id:               number;
  nombre:           string;
  descripcion:      string | null;
  pais:             string | null;
  cliente:          string | null;
  tipo_interaccion: TipoInteraccion | null;
  total_global:     number;
  estado:           EstadoBoleta;
  estado_label:     string;
  es_editable:      boolean;
  puede_evaluarse:  boolean;
  created_by:       number;
  versiones_count?: number;
  borrador_version_id?: number | null;
  creador?:         { id: number; name: string };
  versiones?:       BoletaVersion[];
  version_activa?:  BoletaVersion;
  created_at:       string;
  updated_at:       string;
}

export interface BoletaVersion {
  id:                 number;
  boleta_id:          number;
  numero_version:     number;
  es_activa:          boolean;
  es_editable:        boolean;
  tiene_evaluaciones: boolean;
  areas:              Area[];
  segmentos:          Segmento[];
  created_at:         string;
}

export interface Segmento {
  id:                number;
  boleta_version_id: number;
  nombre:            string;
  tipo:              TipoSegmento;
  tipo_label:        string;
  peso:              number | null;
  penalizacion:      number | null;
  orden:             number;
  preguntas:         Pregunta[];
}

export interface Pregunta {
  id:                   number;
  segmento_id:          number;
  texto:                string;
  tipo:                 TipoPregunta;
  tipo_label:           string;
  peso:                 number | null;
  anula_segmento:       boolean;
  comentario_requerido: ComentarioRequerido;
  comentario_requerido_label: string;
  orden:                number;
  opciones:             PreguntaOpcion[];
}

export interface PreguntaOpcion {
  id:    number;
  texto: string;
  valor: number;
  orden: number;
}

export interface Evaluacion {
  id:                  number;
  boleta_version_id:   number;
  area_id:             number | null;
  evaluador_id:        number | null;
  agente_nombre:       string;
  total_normal:        number;
  total_penalizacion:  number;
  nota_final:          number;
  nivel_calidad:       string;
  estado:              'borrador' | 'completada';
  area?:               Area;
  evaluador?:          { id: number; name: string };
  respuestas?:         Respuesta[];
  created_at:          string;
  updated_at:          string;
}

export interface Respuesta {
  id:              number;
  evaluacion_id:   number;
  pregunta_id:     number;
  respuesta_valor: string;
  puntaje_obtenido: number;
  comentario:      string | null;
  pregunta?:       {
    id:              number;
    texto:           string;
    segmento_id:     number;
    segmento_nombre: string;
  };
}

// ─── DTOs para formularios ─────────────────────────────────────────────────────
export interface CreateBoletaDto {
  nombre:           string;
  descripcion?:     string;
  pais?:            string;
  cliente?:         string;
  tipo_interaccion?: TipoInteraccion;
  total_global?:    number;
}

export interface CreateSegmentoDto {
  nombre:      string;
  tipo:        TipoSegmento;
  peso?:       number;
  penalizacion?: number;
  orden?:      number;
}

export interface CreatePreguntaDto {
  texto:                string;
  tipo:                 TipoPregunta;
  peso?:                number;
  anula_segmento?:      boolean;
  comentario_requerido?: ComentarioRequerido;
  orden?:               number;
  opciones?:            { texto: string; valor: number; orden?: number }[];
}

export interface CreateEvaluacionDto {
  boleta_version_id: number;
  area_id?:          number;
  agente_nombre:     string;
  respuestas: {
    pregunta_id:     number;
    respuesta_valor: string;
    comentario?:     string;
  }[];
}

export interface BoletaPaginatedResponse {
  data: Boleta[];
  meta: {
    current_page: number;
    last_page:    number;
    per_page:     number;
    total:        number;
  };
}

export interface EvaluacionPaginatedResponse {
  data: Evaluacion[];
  meta: {
    current_page: number;
    last_page:    number;
    per_page:     number;
    total:        number;
  };
}

