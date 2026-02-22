import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private tokenKey = 'access_token';
  private userKey = 'user_data';

  /**
   * Guarda el token en localStorage o sessionStorage según preferencia
   * @param token Token de acceso
   * @param persist Si true, usa localStorage (permanente). Si false, usa sessionStorage (sesión)
   */
  setToken(token: string, persist: boolean = true): void {
    const storage = persist ? localStorage : sessionStorage;
    storage.setItem(this.tokenKey, token);
  }

  /**
   * Obtiene el token desde localStorage o sessionStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }

  /**
   * Elimina el token de ambos storages
   */
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
  }

  /**
   * Guarda el usuario en localStorage o sessionStorage según preferencia
   * @param user Datos del usuario
   * @param persist Si true, usa localStorage (permanente). Si false, usa sessionStorage (sesión)
   */
  setUser(user: any, persist: boolean = true): void {
    const storage = persist ? localStorage : sessionStorage;
    storage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Obtiene el usuario desde localStorage o sessionStorage
   */
  getUser(): any {
    const userLocal = localStorage.getItem(this.userKey);
    const userSession = sessionStorage.getItem(this.userKey);
    const user = userLocal || userSession;
    return user ? JSON.parse(user) : null;
  }

  /**
   * Elimina el usuario de ambos storages
   */
  removeUser(): void {
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.userKey);
  }

  /**
   * Verifica si existe un token válido
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
