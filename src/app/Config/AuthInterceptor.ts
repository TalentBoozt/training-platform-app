import { Injectable } from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpClient} from '@angular/common/http';
import {catchError, map, Observable, switchMap, throwError} from 'rxjs';
import {AuthService} from '../services/support/auth.service';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService,
              private http: HttpClient,
              private router: Router) {}

  baseUrlSimple = environment.apiUrlSimple;

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = this.authService.getAuthToken();

    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error.status === 401 && error.error.message === 'Token has expired') {
          return this.refreshToken().pipe(
            switchMap((newToken: string) => {
              // Retry the original request with the new token
              request = request.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next.handle(request);
            }),
            catchError((refreshError) => {
              // If refresh fails, logout the user
              this.authService.logout();
              this.router.navigate(['/login']);
              return throwError(refreshError);
            })
          );
        } else {
          return throwError(error);
        }
      })
    );
  }

  refreshToken(): Observable<string> {
    const refreshToken = this.authService.getRefreshToken();
    if (!refreshToken) {
      return throwError('No refresh token available');
    }

    return this.http.post<{ token: string }>(`${this.baseUrlSimple}/api/auth/refresh-token`, { refreshToken }).pipe(
      map((response) => {
        const newToken = response.token;
        this.authService.createAuthToken(newToken);
        return newToken;
      })
    );
  }
}
