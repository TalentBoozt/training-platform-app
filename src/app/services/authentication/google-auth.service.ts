import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {AuthConfig, NullValidationHandler, OAuthService} from "angular-oauth2-oidc";
import { environment } from "../../../environments/environment";
import { CredentialService } from "../credential.service";
import { Router } from "@angular/router";
import { AlertsService } from "../alerts.service";
import { AuthService } from "../auth.service";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import {WindowService} from "../common/window.service";

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService implements OnInit, OnDestroy {
  googleAuthConfig: AuthConfig = environment.googleAuthConfig;

  private hasLoggedIn = false;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private oauthService: OAuthService,
    private credentialService: CredentialService,
    private alertService: AlertsService,
    private cookieService: AuthService,
    private http: HttpClient,
    private router: Router,
    private windowService: WindowService
  ) {}

  ngOnInit() {
    if (this.windowService.nativeWindow) {
      this.googleAuthConfig.redirectUri = `${window.location.origin}/oauth-callback`;
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  configureOAuth() {
    this.oauthService.configure(this.googleAuthConfig);
    this.oauthService.tokenValidationHandler = new NullValidationHandler();
    this.loadDiscoveryDocumentAndTryLogin();
  }

  private loadDiscoveryDocumentAndTryLogin() {
    this.oauthService.loadDiscoveryDocumentAndTryLogin()
      .then(() => {
        if (this.oauthService.hasValidAccessToken()) {
          if (!this.cookieService.isExists()) {
            this.oauthService.logOut();
            return;
          }
          this.handleGoogleLogin();
        } else {
          this.alertService.warningMessage('No valid access token found', 'Warning');
          return;
        }
      })
      .catch((error) => {
        if(error == 'ReferenceError: window is not defined') return;
        this.alertService.errorMessage('Error loading discovery document: ' + error, 'Error');
      });
  }

  loginWithGoogle() {
    this.oauthService.initLoginFlow();
  }

  handleRedirectCallback() {
    if (this.windowService.nativeWindow && this.windowService.nativeSessionStorage){
      const fragment = window.location.hash.substring(1);
      const params = new URLSearchParams(fragment);

      const accessToken = params.get('access_token');
      const idToken = params.get('id_token');

      if (accessToken && idToken) {
        sessionStorage.setItem('access_token', accessToken);
        sessionStorage.setItem('id_token', idToken);

        if (!this.hasLoggedIn) {
          this.handleGoogleLogin();
          this.hasLoggedIn = true;
        }
      } else {
        this.alertService.errorMessage('Access token or ID token not found', 'Error');
      }
    }
  }

  private handleGoogleLogin() {
    const accessToken = this.oauthService.getAccessToken();
    const userInfoEndpoint = 'https://www.googleapis.com/oauth2/v3/userinfo';

    this.http.get(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).subscribe(
      (profile: any) => this.processUserProfile(profile),
      (error) => {
        this.alertService.errorMessage('Error loading user profile: ' + (error.message || error), 'Error');
      }
    );
  }

  private processUserProfile(profile: any) {
    if (profile) {
      const user = {
        email: profile.email,
        firstName: profile.given_name,
        lastName: profile.family_name,
      };

      this.credentialService.fetchCredentialByEmail(user.email).subscribe(
        (response: any) => {
          if (response) {
            this.processLogin(response);
          } else {
            this.registerGoogleUser(user);
          }
        },
        (error) => {
          this.alertService.errorMessage('Error while checking user: ' + error, 'Error');
        }
      );
    } else {
      this.alertService.errorMessage('Invalid user profile data received', 'Error');
    }
  }

  private registerGoogleUser(profile: any) {
    const newUser = {
      email: profile.email,
      firstname: profile.firstName,
      lastname: profile.lastName,
      role: 'candidate',
      userLevel: '1',
    };

    this.credentialService.addCredential(newUser).subscribe(
      (response: any) => {
        this.processLogin(response);
      },
      (error) => {
        this.alertService.errorMessage('Error registering user: ' + error, 'Error');
      }
    );
  }

  private processLogin(user: any) {
    this.cookieService.createUserID(user.employeeId);
    this.cookieService.createLevel(user.userLevel);
    this.cookieService.unlock();
    setTimeout(() => {
      if (user.role === 'candidate') {
        this.router.navigate(['/candidate-profile']);
        this.alertService.successMessage('Login successful', 'Success');
      } else if (user.role === 'employer') {
        this.handleEmployerLogin(user);
      }
    },500)
  }

  private handleEmployerLogin(user: any) {
    const route = user.userLevel === '2' ? '/dashboard' : user.userLevel === '3' ? '/pro' : '/';
    this.setEmployerSession(user, route);
  }

  private setEmployerSession(user: any, route: string) {
    this.cookieService.createUserID(user.employeeId);
    this.cookieService.createAdmin(user.email);
    this.cookieService.createOrganizationID(user.companyId);
    this.cookieService.createLevel(user.userLevel);
    this.cookieService.unlock();
    this.router.navigate([route]);
  }

  logout() {
    this.oauthService.logOut();
    this.router.navigate(['/login']);
  }
}
