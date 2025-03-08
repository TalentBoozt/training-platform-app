import {AfterViewInit, Component} from '@angular/core';
import {CredentialService} from '../../../services/credential.service';
import {ThemeService} from '../../../services/theme.service';
import {NgIf, NgStyle} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {WindowService} from '../../../services/common/window.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    NgStyle,
    FormsModule,
    RouterLink,
    NgIf
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  standalone: true
})
export class ResetPasswordComponent implements AfterViewInit{
  email: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private credentialService: CredentialService, public themeService: ThemeService, private windowService: WindowService ) {}

  onSubmit() {
    this.loading = false;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.email !== '') {
      this.loading = true;
      this.credentialService.resetPasswordRequest(this.email).subscribe(
        (response) => {
          this.loading = false;
          this.email = '';
          this.successMessage = 'Password reset link has been sent to your email';
        },
        (error) => {
          this.loading = false;
          this.errorMessage = 'Failed to send password reset link. Please try again.';
        }
      )
    }
  }

  ngAfterViewInit() {
    if (this.windowService.nativeDocument){
      const icons = document.querySelectorAll('.material-icons');
      icons.forEach((icon) => {
        icon.setAttribute('translate', 'no');
      });
    }
  }
}
