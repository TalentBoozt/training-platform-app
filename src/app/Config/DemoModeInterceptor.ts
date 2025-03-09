import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import {WindowService} from '../services/common/window.service';

@Injectable()
export class DemoModeInterceptor implements HttpInterceptor {
  constructor(private windowService: WindowService) {
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.windowService.nativeLocalStorage){
      const isDemo = localStorage.getItem('demoMode') === 'true';
      if (isDemo) {
        req = req.clone({ setHeaders: { 'X-Demo-Mode': 'true' } });
      }
    }
    return next.handle(req);
  }
}
