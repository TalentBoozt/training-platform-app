import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/support/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private cookieService: AuthService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    const userId = this.cookieService.userID();
    const companyId = this.cookieService.organization();
    const refreshToken = this.cookieService.isRefreshToken();

    if (userId && companyId && refreshToken) {
      return true;
    } else {
      this.cookieService.redirectToLogin();
      return false;
    }
  }
}
