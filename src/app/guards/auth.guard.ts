import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/support/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private cookieService: AuthService) { }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const initialized = await this.cookieService.initSSO();

    const userId = this.cookieService.userID();
    const companyId = this.cookieService.organization();
    const refreshToken = this.cookieService.isRefreshToken();

    return true;

    if (initialized && userId && companyId && refreshToken) {
      return true;
    } else {
      this.cookieService.redirectToLogin();
      return false;
    }
  }
}
