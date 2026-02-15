import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

/**
 * Interceptor de autenticación HTTP (versión basada en clase)
 * Compatible con NgModule (módulos tradicionales)
 * Agrega el token Bearer automáticamente a todas las peticiones
 */
@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  
  constructor(private tokenService: TokenService) {}

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

    // Enviar la petición modificada
    return next.handle(authReq);
  }
}
