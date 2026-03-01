import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Segmento, CreateSegmentoDto } from '../models/boleta.model';

@Injectable({ providedIn: 'root' })
export class SegmentoService {
  private api = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  /** Lista segmentos de una versión con sus preguntas. */
  getSegmentos(versionId: number): Observable<Segmento[]> {
    return this.http
      .get<{ data: Segmento[] }>(`${this.api}/boleta-versiones/${versionId}/segmentos`)
      .pipe(map(r => r.data));
  }

  createSegmento(versionId: number, dto: CreateSegmentoDto): Observable<Segmento> {
    return this.http
      .post<{ data: Segmento }>(`${this.api}/boleta-versiones/${versionId}/segmentos`, dto)
      .pipe(map(r => r.data));
  }

  updateSegmento(id: number, dto: Partial<CreateSegmentoDto>): Observable<Segmento> {
    return this.http
      .put<{ data: Segmento }>(`${this.api}/segmentos/${id}`, dto)
      .pipe(map(r => r.data));
  }

  deleteSegmento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/segmentos/${id}`);
  }

  /** Distribuye el peso del segmento equitativamente entre sus preguntas. */
  distribuirPesos(id: number): Observable<Segmento> {
    return this.http
      .post<{ data: Segmento }>(`${this.api}/segmentos/${id}/distribuir`, {})
      .pipe(map(r => r.data));
  }
}
