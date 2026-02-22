import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de todos los usuarios
   */
  getUsers(): Observable<User[]> {
    return this.http.get<{ data: User[] }>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  /**
   * Obtiene un usuario específico por ID
   */
  getUser(id: number): Observable<User> {
    return this.http.get<{ data: User }>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(userData: CreateUserDto): Observable<User> {
    return this.http.post<{ data: User }>(this.apiUrl, userData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(id: number, userData: UpdateUserDto): Observable<User> {
    return this.http.put<{ data: User }>(`${this.apiUrl}/${id}`, userData).pipe(
      map(response => response.data)
    );
  }

  /**
   * Elimina un usuario por ID
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
