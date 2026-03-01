import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Area } from '../models/boleta.model';

@Injectable({ providedIn: 'root' })
export class AreaService {
  private api = `${environment.apiUrl}/areas`;

  constructor(private http: HttpClient) {}

  getAreas(soloActivas = false): Observable<Area[]> {
    // HttpParams es inmutable: cada .set() devuelve una NUEVA instancia
    const params = soloActivas ? new HttpParams().set('activa', '1') : undefined;
    return this.http.get<{ data: Area[] }>(this.api, { params }).pipe(
      map(r => r.data)
    );
  }

  getArea(id: number): Observable<Area> {
    return this.http.get<{ data: Area }>(`${this.api}/${id}`).pipe(
      map(r => r.data)
    );
  }

  createArea(dto: { nombre: string; activa?: boolean }): Observable<Area> {
    return this.http.post<{ data: Area }>(this.api, dto).pipe(
      map(r => r.data)
    );
  }

  updateArea(id: number, dto: { nombre?: string; activa?: boolean }): Observable<Area> {
    return this.http.put<{ data: Area }>(`${this.api}/${id}`, dto).pipe(
      map(r => r.data)
    );
  }

  deleteArea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
