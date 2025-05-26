import { Injectable } from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpClient, HttpResponse} from '@angular/common/http';
import {BehaviorSubject, catchError, finalize, map, Observable, switchMap, tap, throwError} from 'rxjs';
import {AuthService} from '../services/support/auth.service';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {WindowService} from '../services/common/window.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private baseUrlSimple = environment.apiUrlSimple;

  private refreshTokenInProgress: boolean = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private windowService: WindowService,
    private http: HttpClient,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isRefreshRequest = request.url.includes('/auth/refresh-token');
    let sessionId = '';
    if (this.windowService.nativeSessionStorage) {
      sessionId = sessionStorage.getItem("session_id") || '';
    }

    if (!isRefreshRequest) {
      const token = this.authService.getRefreshToken();
      const offset = String(new Date().getTimezoneOffset());

      request = request.clone({
        setHeaders: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'X-Session-Id': sessionId,
          'X-Offset': offset
        }
      });
    }

    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const mismatch = event.headers.get('X-Timezone-Mismatch');
          if (mismatch === 'true') {
            this.router.navigate(['/captcha-challenge']);
          }
        }
      }),
      catchError((error) => {
        if (error.status === 401 && error.error?.error === 'Token has expired') {
          return this.handleTokenExpiration(request, next);
        } else {
          return throwError(error);
        }
      })
    );
  }

  private handleTokenExpiration(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let sessionId = '';
    if (this.windowService.nativeSessionStorage) {
      sessionId = sessionStorage.getItem("session_id") || '';
    }

    if (!this.refreshTokenInProgress) {
      this.refreshTokenInProgress = true;

      this.refreshToken().pipe(
        switchMap((newToken: string) => {
          // Retry the original request with the new token and headers
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`,
              'X-Session-Id': sessionId,
              'X-Offset': String(new Date().getTimezoneOffset())
            }
          });
          return next.handle(request);
        }),
        catchError((refreshError) => {
          this.authService.logout();
          this.authService.redirectToLogin();
          return throwError(refreshError);
        }),
        finalize(() => {
          this.refreshTokenInProgress = false;
          this.refreshTokenSubject.next(null);
        })
      ).subscribe();
    }

    return this.refreshTokenSubject.pipe(
      switchMap(() => {
        const newToken = this.authService.getAuthToken();
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`,
            'X-Session-Id': sessionId,
            'X-Offset': String(new Date().getTimezoneOffset())
          }
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
