import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip interceptor for auth endpoints
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  return from(authService.getAccessToken()).pipe(
    switchMap(token => {
      console.log(token)
      if (token) {
        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${environment.supabaseSKey}`,
            apikey: environment.supabaseKey,
            'Content-Type': 'application/json'
          }
        });
        return next(cloned);
      }
      return next(req);
    }),
    catchError(error => {
      console.error('HTTP Error:', error);
      return throwError(() => error);
    })
  );
};
