import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de todos los roles activos
   */
  getRoles(): Observable<Role[]> {
    return this.http.get<{ data: Role[] }>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Obtiene un rol específico por ID
   */
  getRole(id: number): Observable<Role> {
    return this.http.get<{ data: Role }>(this.apiUrl + `/${id}`).pipe(
      map(response => response.data)
    );
  }
}
