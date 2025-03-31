import { Injectable } from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpClient} from '@angular/common/http';
import {BehaviorSubject, catchError, finalize, map, Observable, switchMap, throwError} from 'rxjs';
import {AuthService} from '../services/support/auth.service';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private baseUrlSimple = environment.apiUrlSimple;

  private refreshTokenInProgress: boolean = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token = this.authService.getRefreshToken();

    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error.status === 401 && error.error.error === 'Token has expired') {
          return this.handleTokenExpiration(request, next);
        } else {
          return throwError(error);
        }
      })
    );
  }

  private handleTokenExpiration(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.refreshTokenInProgress) {
      this.refreshTokenInProgress = true;

      this.refreshToken().pipe(
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
        }),
        finalize(() => {
          this.refreshTokenInProgress = false;
          this.refreshTokenSubject.next(null);  // Reset the subject when refresh is done
        })
      ).subscribe();
    }

    // Wait until the refresh token request is done, then retry the failed request
    return this.refreshTokenSubject.pipe(
      switchMap(() => {
        const newToken = this.authService.getAuthToken(); // Get the new token
        request = request.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` }
        });
        return next.handle(request);
      })
    );
  }

  private refreshToken(): Observable<string> {
    const refreshToken = this.authService.getRefreshToken();
    if (!refreshToken) {
      return throwError('No refresh token available');
    }

    return this.http.post<{ token: string }>(`${this.baseUrlSimple}/api/auth/refresh-token`, { refreshToken }).pipe(
      map((response) => {
        const newToken = response.token;
        this.authService.createAuthToken(newToken);
        this.refreshTokenSubject.next(newToken);
        return newToken;
      })
    );
  }
}
