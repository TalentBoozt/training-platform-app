import {AfterViewInit, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {CredentialService} from '../../../services/credential.service';
import {AlertsService} from '../../../services/alerts.service';
import {EncryptionService} from '../../../services/encryption.service';
import {ThemeService} from '../../../services/theme.service';
import {AuthService} from '../../../services/auth.service';
import {NgClass, NgStyle} from '@angular/common';
import {WindowService} from '../../../services/common/window.service';

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
    role: new FormControl('candidate'),  // Default to 'candidate'
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
              private windowService: WindowService,
              public themeService: ThemeService,
              private cookieService: AuthService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['from'] === 'companies') {
        this.registerForm.patchValue({ role: 'employer' });
      } else {
        this.registerForm.patchValue({ role: 'candidate' });
      }
    });
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

      if (password && password.length >= 6) {
        const isPwned = await this.encryptionService.checkLeakedPassword(password);
        if (isPwned) {
          this.alertService.errorMessage('This password has been compromised in data breaches. Please choose a different one.', 'Weak Password');
          return;
        }

        const encryptedPassword = await this.encryptionService.encryptPassword(password);

        this.credentialService.addCredential({
          firstname: formData.name?.split(' ')[0],
          lastname: formData.name?.split(' ')[1] || '',
          email: formData.email,
          password: encryptedPassword,
          role: formData.role,
          userLevel: formData.role === 'candidate' ? "1" : "2",
        }).subscribe((response: any) => {
          if (!response) {
            this.alertService.errorMessage('User already exists or an unexpected error has occurred', 'Unexpected Error');
            return;
          }
          if (formData.role === 'candidate') {
            this.router.navigate(['/candidate-profile']);
            this.cookieService.createUserID(response.employeeId);
            this.cookieService.createLevel(response.userLevel);
          } else if (formData.role === 'employer') {
            this.router.navigate(['/dashboard']);
            this.cookieService.createUserID(response.employeeId);
            this.cookieService.createLevel(response.userLevel);
            this.cookieService.createAdmin(response.email);
            this.cookieService.createOrganizationID(response.companyId);
          }
        }, error => {
          this.alertService.errorMessage('User already exists or an unexpected error has occurred', 'Unexpected Error');
        });
      } else {
        this.alertService.errorMessage('Password must be at least 6 characters long', 'Weak Password');
      }
    } else {
      this.errorMsg = 'Please fill in all the fields';
      this.alertService.errorMessage('Please fill in all required fields', 'Missing Fields');
    }
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
