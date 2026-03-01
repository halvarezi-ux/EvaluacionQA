import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Boleta,
  BoletaVersion,
  BoletaPaginatedResponse,
  CreateBoletaDto,
} from '../models/boleta.model';

@Injectable({ providedIn: 'root' })
export class BoletaService {
  private api = `${environment.apiUrl}/boletas`;

  constructor(private http: HttpClient) {}

  getBoletas(filtros: Record<string, any> = {}): Observable<BoletaPaginatedResponse> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<BoletaPaginatedResponse>(this.api, { params });
  }

  getBoleta(id: number): Observable<Boleta> {
    return this.http.get<{ data: Boleta }>(`${this.api}/${id}`).pipe(
      map(r => r.data)
    );
  }

  createBoleta(dto: CreateBoletaDto): Observable<Boleta> {
    return this.http.post<{ data: Boleta }>(this.api, dto).pipe(
      map(r => r.data)
    );
  }

  updateBoleta(id: number, dto: Partial<CreateBoletaDto>): Observable<Boleta> {
    return this.http.put<{ data: Boleta }>(`${this.api}/${id}`, dto).pipe(
      map(r => r.data)
    );
  }

  deleteBoleta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  /** Activa la boleta (draft → activa). Valida estructura en el backend. */
  activarBoleta(id: number): Observable<Boleta> {
    return this.http.post<{ data: Boleta }>(`${this.api}/${id}/activar`, {}).pipe(
      map(r => r.data)
    );
  }

  /** Archiva la boleta (cualquier estado → archivada). */
  archivarBoleta(id: number): Observable<Boleta> {
    return this.http.post<{ data: Boleta }>(`${this.api}/${id}/archivar`, {}).pipe(
      map(r => r.data)
    );
  }

  /** Reactiva la boleta (archivada → activa). */
  reactivarBoleta(id: number): Observable<Boleta> {
    return this.http.post<{ data: Boleta }>(`${this.api}/${id}/reactivar`, {}).pipe(
      map(r => r.data)
    );
  }

  /** Clona la versión activa para permitir edición sin romper evaluaciones existentes. */
  clonarVersion(id: number): Observable<Boleta> {
    return this.http.post<{ data: Boleta }>(`${this.api}/${id}/clonar-version`, {}).pipe(
      map(r => r.data)
    );
  }

  /** Publica una versión borrador como la nueva activa (la anterior queda desactivada). */
  publicarVersionBorrador(boletaId: number, versionId: number): Observable<Boleta> {
    return this.http.post<{ data: Boleta }>(`${this.api}/${boletaId}/publicar-borrador/${versionId}`, {}).pipe(
      map(r => r.data)
    );
  }

  /** Descarta una versión borrador (no activa) y elimina todo su contenido. */
  descartarBorrador(boletaId: number, versionId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${boletaId}/borrador/${versionId}`);
  }
}

