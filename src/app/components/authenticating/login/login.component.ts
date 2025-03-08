import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {CredentialService} from '../../../services/credential.service';
import {GoogleAuthService} from '../../../services/authentication/google-auth.service';
import {GitHubAuthService} from '../../../services/authentication/git-hub-auth.service';
import {FacebookAuthService} from '../../../services/authentication/facebook-auth.service';
import {LinkedInAuthService} from '../../../services/authentication/linked-in-auth.service';
import {SocialAuthApiService} from '../../../services/authentication/social-auth-api.service';
import {EncryptionService} from '../../../services/encryption.service';
import {AuthService} from '../../../services/auth.service';
import {ThemeService} from '../../../services/theme.service';
import {AlertsService} from '../../../services/alerts.service';
import {NgClass, NgStyle} from '@angular/common';
import {WindowService} from '../../../services/common/window.service';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    NgStyle,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true
})
export class LoginComponent implements OnInit, AfterViewInit{
  attempts = 4;
  disabled: boolean = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    remember: new FormControl(false)
  });

  isp1open: boolean = true;

  constructor(
    private router: Router,
    private credentialService: CredentialService,
    private googleAuthService: GoogleAuthService,
    private gitHubAuthService: GitHubAuthService,
    private facebookAuthService: FacebookAuthService,
    private linkedInAuthService: LinkedInAuthService,
    private socialAuthService: SocialAuthApiService,
    private encryptionService: EncryptionService,
    private windowService: WindowService,
    private cookieService: AuthService,
    public themeService: ThemeService,
    private alertService: AlertsService) { }

  ngOnInit() {
    this.googleAuthService.configureOAuth();
    this.gitHubAuthService.handleRedirectCallback();
    this.facebookAuthService.initializeFacebookSdk().then(r => {});
    this.linkedInAuthService.initializeLinkedInSdk().then(r => {});
  }

  ngAfterViewInit() {
    if (this.windowService.nativeDocument){
      const icons = document.querySelectorAll('.material-icons');
      icons.forEach((icon) => {
        icon.setAttribute('translate', 'no');
      });
    }

    if (this.windowService.nativeLocalStorage){
      if (localStorage.getItem('email') && localStorage.getItem('password')) {
        this.loginForm.get('email')?.setValue(localStorage.getItem('email'));
        this.loginForm.get('password')?.setValue(localStorage.getItem('password'));
        this.loginForm.get('remember')?.setValue(true);
      }
    }
  }

  loginUser() {
    this.attempts --;
    if (this.loginForm.valid) {
      if (this.windowService.nativeSessionStorage && this.windowService.nativeLocalStorage) {
        if (this.attempts <= 0 || sessionStorage.getItem('LgnAtT') == '0'){
          sessionStorage.setItem('LgnAtT', '0');
          this.alertService.warningMessage('Too many attempts! Try again in 5 minutes', 'Warning');
          this.loginForm.reset();
          this.disabled = true;
          setTimeout(()=>{
            this.attempts = 4;
            sessionStorage.removeItem('LgnAtT');
            this.disabled = false;
          }, 1000 * 60 * 5);
          return;
        }

        const formData = this.loginForm.value;
        this.credentialService.fetchCredentialByEmail(formData.email).subscribe(async (response: any) => {
          if (!response) {
            this.alertService.errorMessage('User doesn\'t exist or something went wrong', 'Error');
            return;
          }

          const encryptedPassword = await this.encryptionService.decryptPassword(response.password?.toString());

          if (sessionStorage.getItem('LgnAtT') != '0'){
            if (formData.password == encryptedPassword) {
              this.cookieService.createSession(response);

              if (this.loginForm.get('remember')?.value) {
                localStorage.setItem('email', <string>this.loginForm.get('email')?.value);
                localStorage.setItem('password', <string>this.loginForm.get('password')?.value);
              } else {
                localStorage.removeItem('email');
                localStorage.removeItem('password');
              }

              if (response.role === 'candidate') {
                this.cookieService.createUserID(response.employeeId);
                this.cookieService.createLevel(response.userLevel);
                this.cookieService.unlock();
                this.router.navigate(['/candidate-profile']);
                this.alertService.successMessage('Login successful', 'Success');
              } else if (response.role === 'employer') {
                if (response.userLevel === "2") {
                  this.cookieService.createUserID(response.employeeId);
                  this.cookieService.createAdmin(response.email);
                  this.cookieService.createOrganizationID(response.companyId);
                  this.cookieService.createLevel(response.userLevel);
                  this.cookieService.unlock();
                  this.router.navigate(['/dashboard']);
                }
                else if (response.userLevel === "3") {
                  this.cookieService.createUserID(response.employeeId);
                  this.cookieService.createProAdmin(response.email);
                  this.cookieService.createOrganizationID(response.companyId);
                  this.cookieService.createLevel(response.userLevel);
                  this.cookieService.unlock();
                  this.router.navigate(['/pro']);
                }
              }
            } else {
              this.alertService.errorMessage('Wrong password', 'Error');
            }
          } else {
            this.alertService.errorMessage('Too many attempts! Try again in 5 minutes', 'Warning');
          }

        }, error => {
          this.alertService.errorMessage('Something went wrong', 'Error');
        });
      }
    } else {
      this.alertService.errorMessage('Form is not valid', 'Error');
    }
  }

  loginWithGoogle(): void {
    this.googleAuthService.loginWithGoogle();
  }

  loginWithGithub() {
    this.gitHubAuthService.loginWithGitHub();
  }

  loginWithLinkedin() {
    this.linkedInAuthService.loginWithLinkedIn();
  }

  loginWithFacebook() {
    this.facebookAuthService.loginWithFacebook();
  }

  togglePasswordVisibility(){
    if (this.windowService.nativeDocument){
      const input: HTMLInputElement = document.getElementById('password') as HTMLInputElement;
      if (input.type === 'password'){
        input.type = 'text';
        this.isp1open = false;
      } else {
        input.type = 'password';
        this.isp1open = true;
      }
    }
  }
}
