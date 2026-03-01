import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from './token.service';

/**
 * Interceptor de autenticación HTTP (versión basada en clase)
 * Compatible con NgModule (módulos tradicionales)
 * - Agrega el token Bearer automáticamente a todas las peticiones
 * - Intercepta errores 401 y redirige al login limpiando la sesión
 */
@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  
  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();

    // Si no hay token, enviar la petición sin modificar
    if (!token) {
      return next.handle(req);
    }

    // Clonar la petición y agregar el header Authorization
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    // Enviar la petición y capturar errores 401 (token expirado o inválido)
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token inválido o expirado: limpiar sesión y redirigir al login
          this.tokenService.clearAll();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
