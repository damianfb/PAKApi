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

  // Only intercept requests to Supabase functions
  if (!req.url.includes(environment.supabaseUrl)) {
    return next(req);
  }

  return from(authService.getAccessToken()).pipe(
    switchMap(token => {
      // Debug: mostrar qué token se está usando
      const hasUserToken = !!token;
      console.log(`[Auth Interceptor] URL: ${req.url.split('/').pop()}, User token: ${hasUserToken}`);
      
      // Siempre usar service_role key para las Edge Functions
      // Las Edge Functions necesitan bypasear RLS para funcionar correctamente
      // ya que no estamos implementando autenticación por usuario
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${environment.supabaseSKey}`,
          apikey: environment.supabaseKey,
          'Content-Type': 'application/json'
        }
      });
      return next(cloned);
    }),
    catchError(error => {
      console.error('HTTP Error:', error);
      return throwError(() => error);
    })
  );
};
