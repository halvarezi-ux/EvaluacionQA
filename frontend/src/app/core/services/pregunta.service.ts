import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pregunta, CreatePreguntaDto } from '../models/boleta.model';

@Injectable({ providedIn: 'root' })
export class PreguntaService {
  private api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /** Lista preguntas de un segmento con sus opciones. */
  getPreguntas(segmentoId: number): Observable<Pregunta[]> {
    return this.http
      .get<{ data: Pregunta[] }>(`${this.api}/segmentos/${segmentoId}/preguntas`)
      .pipe(map(r => r.data));
  }

  createPregunta(segmentoId: number, dto: CreatePreguntaDto): Observable<Pregunta> {
    return this.http
      .post<{ data: Pregunta }>(`${this.api}/segmentos/${segmentoId}/preguntas`, dto)
      .pipe(map(r => r.data));
  }

  updatePregunta(id: number, dto: Partial<CreatePreguntaDto>): Observable<Pregunta> {
    return this.http
      .put<{ data: Pregunta }>(`${this.api}/preguntas/${id}`, dto)
      .pipe(map(r => r.data));
  }

  deletePregunta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/preguntas/${id}`);
  }
}
