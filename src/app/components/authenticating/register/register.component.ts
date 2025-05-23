import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {CredentialService} from '../../../services/credential.service';
import {AlertsService} from '../../../services/support/alerts.service';
import {EncryptionService} from '../../../services/support/encryption.service';
import {ThemeService} from '../../../services/support/theme.service';
import {AuthService} from '../../../services/support/auth.service';
import {NgClass, NgStyle} from '@angular/common';
import {WindowService} from '../../../services/common/window.service';
import {HttpErrorResponse} from '@angular/common/http';
import {GoogleAuthService} from '../../../services/authentication/google-auth.service';
import {GitHubAuthService} from '../../../services/authentication/git-hub-auth.service';
import {FacebookAuthService} from '../../../services/authentication/facebook-auth.service';
import {LinkedInAuthService} from '../../../services/authentication/linked-in-auth.service';

@Component({
  selector: 'app-register',
  imports: [
    RouterLink,
    NgStyle,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  standalone: true
})
export class RegisterComponent implements OnInit, AfterViewInit{
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    termsCheck: new FormControl(false, [Validators.requiredTrue])
  });

  isp1open: boolean = true;
  errorMsg = '';
  termsErrorMsg = '';

  constructor(private router: Router,
              private route: ActivatedRoute,
              private credentialService: CredentialService,
              private alertService: AlertsService,
              private encryptionService: EncryptionService,
              private googleAuthService: GoogleAuthService,
              private gitHubAuthService: GitHubAuthService,
              private facebookAuthService: FacebookAuthService,
              private linkedInAuthService: LinkedInAuthService,
              private windowService: WindowService,
              public themeService: ThemeService,
              private cookieService: AuthService) { }

  ngOnInit(): void {
    // this.googleAuthService.configureOAuth();
    // this.gitHubAuthService.handleRedirectCallback();
    // this.facebookAuthService.initializeFacebookSdk().then(r => {});
    // this.linkedInAuthService.initializeLinkedInSdk().then(r => {});
  }

  ngAfterViewInit() {
    if (this.windowService.nativeDocument){
      const icons = document.querySelectorAll('.material-icons');
      icons.forEach((icon) => {
        icon.setAttribute('translate', 'no');
      });
    }
  }

  async registerUser() {
    this.errorMsg = '';
    this.termsErrorMsg = '';
    if (this.registerForm.get('termsCheck')?.invalid) {
      this.termsErrorMsg = 'Please accept the terms and conditions';
      this.alertService.errorMessage(this.termsErrorMsg, 'Missing Fields');
      return;
    }

    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      const password = formData.password;
      const referer = this.cookieService.getReferer() || null;
      const platform = this.cookieService.getPlatform();
      const promotion = this.cookieService.getPromotion() || null;

      if (password && password.length >= 6) {
        const isPwned = await this.encryptionService.checkLeakedPassword(password);
        if (isPwned) {
          this.alertService.errorMessage('This password has been compromised in data breaches. Please choose a different one.', 'Weak Password');
          return;
        }

        this.credentialService.register({
          firstname: formData.name?.split(' ')[0],
          lastname: formData.name?.split(' ')[1] || '',
          email: formData.email,
          password: password,
          role: "employer",
          userLevel: "5",
          referrerId: referer,
          platform: platform,
          promotion: promotion,
          active: false
        }).subscribe((response: any) => {
          if (!response) {
            this.alertService.errorMessage('An unexpected error has occurred', 'Unexpected Error');
            return;
          }
          if (response.accessedPlatforms?.includes(platform) && response.accessedPlatforms?.includes('TrainingPlatform')) {
            this.alertService.errorMessage('This email has already been registered', 'Email Already Exists');
            return;
          }
          this.cookieService.createUserID(response.employeeId);
          this.cookieService.createLevel(response.userLevel);
          this.cookieService.createAdmin(response.email);
          response.organizations?.forEach((organization: any) => {
            this.cookieService.createOrganizationID(organization.TrainingPlatform || '');
          })
          this.cookieService.createAuthToken(response.token);
          this.cookieService.createRefreshToken(response.refreshToken);
          this.router.navigate(['/']);
          this.alertService.successMessage('Registration successful! We will review your account and unlock full access as soon as possible!', 'Success');
        }, (error: HttpErrorResponse) => {
          switch (error.status) {
            case 409:
              this.alertService.errorMessage('This email has already been registered', 'Email Already Exists');
              break;
            case 400:
              this.alertService.errorMessage('Please fill in all the required fields', 'Missing Fields');
              break;
            case 500:
              this.alertService.errorMessage('An unexpected error has occurred', 'Unexpected Error');
              break;
            default:
              this.alertService.errorMessage(error.error.message, "Code: "+error.status);
          }
        });
      } else {
        this.alertService.errorMessage('Password must be at least 6 characters long', 'Weak Password');
      }
    } else {
      this.errorMsg = 'Please fill in all the fields';
      this.alertService.errorMessage('Please fill in all required fields', 'Missing Fields');
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
