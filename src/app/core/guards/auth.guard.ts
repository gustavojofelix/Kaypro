import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for the auth service to finish checking the session
  await authService.waitForInit();

  if (authService.currentUserValue) {
    return true;
  }

  return router.parseUrl('/login');
};
