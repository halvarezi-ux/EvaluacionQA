import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;  // ← Cambiar para reutilizar

  constructor(private http: HttpClient) { }

  login(user: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { user, password });
  }

  /**
   * Cierra sesión en el backend (invalida el token en la BD)
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }
}