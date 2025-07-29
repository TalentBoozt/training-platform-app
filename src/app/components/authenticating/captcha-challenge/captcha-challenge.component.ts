import { Component } from '@angular/core';
import {RecaptchaModule} from "ng-recaptcha";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {AuthService} from '../../../services/support/auth.service';
import {WindowService} from '../../../services/common/window.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-captcha-challenge',
  standalone: true,
  imports: [
    RecaptchaModule,
    NgIf
  ],
  templateUrl: './captcha-challenge.component.html',
  styleUrl: './captcha-challenge.component.scss'
})
export class CaptchaChallengeComponent {
  captchaToken: string | null = null;
  verifying = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  baseurl = environment.apiUrlSimple

  constructor(private http: HttpClient, private windowService: WindowService) {
  }

  onCaptchaResolved(token: any) {
    this.captchaToken = token.toString();
    this.verifying = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.http.post(`${this.baseurl}/api/security/verify-captcha`, {
      captchaToken: this.captchaToken
    }).subscribe({
      next: () => {
        if (this.windowService.nativeSessionStorage) {
          sessionStorage.setItem('captcha_verified', 'true');
          sessionStorage.setItem('captcha_verified_at', Date.now().toString());
        }

        this.successMessage = '✅ Verified! Redirecting...';
        setTimeout(() => history.back(), 1000);
      },
      error: () => {
        this.verifying = false;
        this.errorMessage = '❌ CAPTCHA failed. Please try again.';
      }
    });
  }
}
