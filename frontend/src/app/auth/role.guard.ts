import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from './token.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const user = tokenService.getUser();
  const requiredRole = route.data['role'] as string;
  if (user && user.role && user.role === requiredRole) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
