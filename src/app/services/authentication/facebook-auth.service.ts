import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { CredentialService } from '../credential.service';
import { AlertsService } from '../support/alerts.service';
import { AuthService } from '../support/auth.service';
import {WindowService} from "../common/window.service";
import {TimerService} from '../common/timer.service';

declare var FB: any;

@Injectable({
  providedIn: 'root',
})
export class FacebookAuthService {
  private appId = environment.facebookAuthConfig.appId;
  // private redirectUri = `${window.location.origin}/oauth-callback/facebook`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private credentialService: CredentialService,
    private alertService: AlertsService,
    private authService: AuthService,
    private windowService: WindowService,
    private timerService: TimerService
  ) {}

  initializeFacebookSdk() {
    return new Promise<void>((resolve) => {
      if (this.windowService.nativeWindow && this.windowService.nativeDocument){
        (window as any).fbAsyncInit = () => {
          FB.init({
            appId: this.appId,
            cookie: true,
            xfbml: true,
            version: 'v19.0',
          });
          resolve();
        };

        // Dynamically load the Facebook SDK
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    });
  }

  loginWithFacebook() {
    FB.login(
      (response: any) => {
        if (response.authResponse) {
          this.handleAuthResponse(response.authResponse);
        } else {
          this.alertService.errorMessage('Facebook login failed.', 'Error');
        }
      },
      { scope: 'public_profile,email' }
    );
  }

  private handleAuthResponse(authResponse: any) {
    const accessToken = authResponse.accessToken;
    this.fetchUserProfile(accessToken);
  }

  private fetchUserProfile(accessToken: string) {
    FB.api('/me', { fields: 'id,name,email,picture' }, (response: any) => {
      if (response.error) {
        this.alertService.errorMessage('Error fetching user profile.', 'Error');
      } else {
        const user = {
          email: response.email,
          firstName: response.name.split(' ')[0],
          lastName: response.name.split(' ')[1] || '',
          username: response.id,
          avatarUrl: response.picture.data.url,
        };

        this.processUserProfile(user);
      }
    });
  }

  private processUserProfile(profile: any) {
    this.credentialService.fetchCredentialByEmail(profile.email).subscribe(
      (response: any) => {
        if (response) {
          this.processLogin(response);
        } else {
          this.registerFacebookUser(profile);
        }
      },
      (error) => {
        this.alertService.errorMessage('Error while checking user: ' + error, 'Error');
      }
    );
  }

  private registerFacebookUser(profile: any) {
    const referer = this.authService.getReferer();
    const platform = this.authService.getPlatform();
    const promotion = this.authService.getPromotion();
    const newUser = {
      email: profile.email,
      firstname: profile.firstName,
      lastname: profile.lastName,
      role: 'candidate',
      userLevel: '1',
      referrerId: referer,
      platform: platform,
      promotion: promotion
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
    this.authService.createUserID(user.employeeId.toString());
    this.authService.createLevel(user.userLevel.toString());
    this.authService.unlock();
    this.timerService.setTimeout(() => {
      if (user.role === 'candidate') {
        this.router.navigate(['/candidate-profile']);
        this.alertService.successMessage('Login successful', 'Success');
      } else if (user.role === 'employer') {
        this.handleEmployerLogin(user);
      }
    }, 500);
  }

  private handleEmployerLogin(user: any) {
    const route = user.userLevel === '2' ? '/dashboard' : '/home';
    this.router.navigate([route]);
    this.alertService.successMessage('Employer login successful', 'Success');
  }
}
