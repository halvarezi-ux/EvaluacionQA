import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from './token.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const user = tokenService.getUser();
  const requiredRole = route.data['role'] as string;
  
  if (user && user.role) {
    // Manejar tanto objeto {id, nombre} como string directo (backward compatibility)
    const userRole = typeof user.role === 'object' ? user.role.nombre : user.role;
    
    if (userRole === requiredRole) {
      return true;
    }
  }
  
  // Si no tiene el rol requerido, redirigir a página 403
  router.navigate(['/403']);
  return false;
};
