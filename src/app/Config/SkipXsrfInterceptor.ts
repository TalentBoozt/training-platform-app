import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class SkipXsrfInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip XSRF handling for OAuth-related requests
    if (req.url.includes('googleapis.com')) {
      const clonedRequest = req.clone({
        // setHeaders: {
        //   'X-Demo-Mode': 'true'
        // },
        withCredentials: false
      });
      return next.handle(clonedRequest);
    }
    if (req.url.includes('github.com/login/oauth/')) {
      const clonedRequest = req.clone({
        // setHeaders: {
        //   'X-Demo-Mode': 'true'
        // },
        withCredentials: false
      });
      return next.handle(clonedRequest);
    }
    if (req.url.includes('westernmilling.okta.com/.well-known/openid-configuration')) {
      const clonedRequest = req.clone({
        // setHeaders: {
        //   'X-Demo-Mode': 'true'
        // },
        withCredentials: false
      });
      return next.handle(clonedRequest);
    }
    return next.handle(req);
  }
}
