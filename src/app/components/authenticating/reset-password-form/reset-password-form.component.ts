import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CredentialService} from '../../../services/credential.service';
import {EncryptionService} from '../../../services/support/encryption.service';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-reset-password-form',
  imports: [
    NgIf,
    FormsModule
  ],
  templateUrl: './reset-password-form.component.html',
  styleUrl: './reset-password-form.component.scss',
  standalone: true
})
export class ResetPasswordFormComponent implements OnInit{
  token: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private route: ActivatedRoute,
              private credentialService: CredentialService,
              private router: Router,
              private encryptionService: EncryptionService) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'];
  }

  async onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    const encryptedPassword = await this.encryptionService.encryptPassword(this.password);

    this.credentialService.resetPassword(this.token, encryptedPassword).subscribe(
      (response) => {
        this.loading = false;
        this.password = '';
        this.confirmPassword = '';
        this.successMessage = 'Password has been reset successfully';
        setTimeout(() => {
          this.router.navigate(['/login']);
        },1000)
      },
      (error) => {
        this.loading = false;
        this.errorMessage = 'Failed to reset password. Please try again.';
      }
    )
  }
}
