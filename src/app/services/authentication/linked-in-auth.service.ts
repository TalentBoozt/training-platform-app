import {Injectable, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../support/auth.service';
import { CredentialService } from '../credential.service';
import { AlertsService } from "../support/alerts.service";
import {environment} from "../../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {WindowService} from "../common/window.service";

@Injectable({
  providedIn: 'root',
})
export class LinkedInAuthService{
  private linkedInSdkLoaded = false;
  baseUrl = environment.apiUrl;
  private clientId = environment.linkedinAuthConfig.clientId
  private redirectUri = environment.linkedinAuthConfig.redirectUri

  constructor(
    private router: Router,
    private alertService: AlertsService,
    private authService: AuthService,
    private credentialService: CredentialService,
    private windowService: WindowService,
    private http: HttpClient
  ) {}

  // ngOnInit(): void {
  //   const window = this.windowService.nativeWindow;
  //   if (window) {
  //     this.redirectUri = `${window.location.origin}/oauth-callback/linkedin`;
  //   }
  // }

  /**
   * Dynamically loads the LinkedIn SDK script
   * @returns Promise<void>
   */
  initializeLinkedInSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.windowService.nativeDocument){
        if (this.linkedInSdkLoaded) {
          resolve();
          return;
        }

        const scriptId = 'linkedin-sdk';
        if (document.getElementById(scriptId)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://platform.linkedin.com/in.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = `api_key: ${this.clientId}\nauthorize: true\nonLoad: onLinkedInLoad`;

        script.onload = () => {
          this.linkedInSdkLoaded = true;
          resolve();
        };

        script.onerror = (error) => {
          console.error('LinkedIn SDK failed to load', error);
          reject(error);
        };

        document.body.appendChild(script);
      }
    });
  }

  /**
   * Initiates the LinkedIn login flow
   * @returns Promise<any>
   */
  loginWithLinkedIn(): void {
    if (this.windowService.nativeWindow && this.windowService.nativeLocalStorage){
      const clientId = this.clientId;
      const redirectUri = encodeURIComponent(this.redirectUri);
      const state = Math.random().toString(36).substring(7);

      const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=openid%20profile%20email`;

      // Save the state to localStorage for verification later
      localStorage.setItem('linkedin_auth_state', state);

      // Redirect to LinkedIn OAuth page
      window.location.href = linkedInAuthUrl;
    }
  }

  handleLinkedInCallback(urlParams:any, code:any, state:any, storedState:any): void {
    if (state !== storedState) {
      this.alertService.errorMessage('Invalid state parameter. Login failed.', 'Error');
      return;
    }

    // Exchange the authorization code for an access token
    this.exchangeAuthorizationCode(code)
  }

  exchangeAuthorizationCode(code: any) {
    const body: any = { code };
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    })
    this.http.post<any>(`${this.baseUrl}/linkedin/exchange-code`, body, {headers}).subscribe(
      (response) => {
        const accessToken = response.access_token;
        setTimeout(() => {
          this.http.get<any>(`${this.baseUrl}/linkedin/profile?accessToken=${accessToken}`, {headers}).subscribe(
            (response) => {
              this.handleAuthResponse(response);
            },
            (error) => {
              console.error('Error fetching user profile:', error);
            }
          );
        }, 1500);
      },
      (error) => {
        console.error('Error exchanging code for token:', error);
      }
    );
  }

  /**
   * Handles the LinkedIn authentication response
   */
  private handleAuthResponse(authResponse: any) {
    const user = {
      email: authResponse.profile.email,
      firstName: authResponse.profile.family_name,
      lastName: authResponse.profile.given_name,
      username: authResponse.id,
      avatarUrl: authResponse.profile.picture,
    };

    this.processUserProfile(user);
  }

  /**
   * Processes the user profile and determines login or registration
   */
  private processUserProfile(profile: any) {
    this.credentialService.fetchCredentialByEmail(profile.email).subscribe(
      (response: any) => {
        if (response) {
          this.processLogin(response);
        } else {
          this.registerLinkedInUser(profile);
        }
      },
      (error) => {
        this.alertService.errorMessage('Error while checking user: ' + error, 'Error');
      }
    );
  }

  /**
   * Registers a new user via LinkedIn data
   */
  private registerLinkedInUser(profile: any) {
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

  /**
   * Processes user login
   */
  private processLogin(user: any) {
    this.authService.createUserID(user.employeeId.toString());
    this.authService.createLevel(user.userLevel.toString());
    this.authService.unlock();
    setTimeout(() => {
      if (user.role === 'candidate') {
        this.router.navigate(['/candidate-profile']);
        this.alertService.successMessage('Login successful', 'Success');
      } else if (user.role === 'employer') {
        this.handleEmployerLogin(user);
      }
    }, 500);
  }

  /**
   * Handles employer-specific login actions
   */
  private handleEmployerLogin(user: any) {
    const route = user.userLevel === '2' ? '/dashboard' : '/home';
    this.router.navigate([route]);
    this.alertService.successMessage('Employer login successful', 'Success');
  }

  /**
   * Logs the user out of LinkedIn
   * @returns Promise<void>
   */
  logoutFromLinkedIn(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.windowService.nativeWindow){
        if (!(window as any)['IN'] || !(window as any)['IN'].User) {
          reject('LinkedIn SDK is not initialized.');
          return;
        }

        (window as any)['IN'].User.logout(() => {
          console.log('Logged out from LinkedIn');
          resolve();
        }, (error: string) => {
          console.error('Error logging out from LinkedIn', error);
          reject(error);
        });
      }
    });
  }
}
