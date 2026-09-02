import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() || inject(Router).createUrlTree(['/login']);
};

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return router.createUrlTree(['/dashboard']);
  if (router.getCurrentNavigation()?.extras.state?.['adminCreated'] === true) return true;

  return auth.getSetupStatus().pipe(
    map((setupRequired) =>
      setupRequired ? router.createUrlTree(['/setup/admin']) : true,
    ),
    catchError(() => of(true)),
  );
};

export const firstAdminSetupGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.getSetupStatus().pipe(
    map((setupRequired) =>
      setupRequired ? true : router.createUrlTree(['/login']),
    ),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
