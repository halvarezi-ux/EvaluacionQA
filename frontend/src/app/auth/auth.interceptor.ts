import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from './token.service';

/**
 * Interceptor de autenticación HTTP
 * Agrega el token Bearer a todas las peticiones salientes
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  // Si no hay token, enviar la petición sin modificar
  if (!token) {
    return next(req);
  }

  // Clonar la petición y agregar el header Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  // Enviar la petición modificada
  return next(authReq);
};