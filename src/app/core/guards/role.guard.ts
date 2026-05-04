import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const expectedRoles = route.data['roles'] as Role[];
  const currentUser = authService.currentUserValue;

  if (currentUser && expectedRoles.includes(currentUser.role)) {
    return true;
  }
  
  if (!currentUser) {
    return router.parseUrl('/login');
  }

  switch (currentUser.role) {
    case Role.SOLICITANTE_OBRAS:
      return router.parseUrl('/requisitions');
    case Role.ADMINISTRACAO:
      return router.parseUrl('/approvals/admin');
    case Role.PCA:
      return router.parseUrl('/dashboard');
    default:
      return router.parseUrl('/login');
  }
};
