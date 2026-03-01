import { Injectable }             from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable }             from 'rxjs';
import { map }                    from 'rxjs/operators';

import { environment }            from '../../../environments/environment';
import {
  Evaluacion,
  CreateEvaluacionDto,
  EvaluacionPaginatedResponse,
} from '../../core/models/boleta.model';
import { scoreToNivel }           from '../models/evaluacion.model';

@Injectable({ providedIn: 'root' })
export class EvaluacionService {
  private api = `${environment.apiUrl}/evaluaciones`;

  constructor(private http: HttpClient) {}

  getEvaluaciones(filtros: Record<string, any> = {}): Observable<EvaluacionPaginatedResponse> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([k, v]) => {
      if (v != null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<EvaluacionPaginatedResponse>(this.api, { params });
  }

  getEvaluacion(id: number): Observable<Evaluacion> {
    return this.http.get<{ data: Evaluacion }>(`${this.api}/${id}`).pipe(
      map(r => r.data)
    );
  }

  crearEvaluacion(dto: CreateEvaluacionDto): Observable<Evaluacion> {
    return this.http.post<{ data: Evaluacion }>(this.api, dto).pipe(
      map(r => r.data)
    );
  }

  /** Convierte nota_final del backend a nivel de calidad para UI */
  notaToNivel = scoreToNivel;
}
