import { Component } from '@angular/core';
import {RecaptchaModule} from "ng-recaptcha";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {AuthService} from '../../../services/support/auth.service';

@Component({
  selector: 'app-captcha-challenge',
  standalone: true,
  imports: [
    RecaptchaModule
  ],
  templateUrl: './captcha-challenge.component.html',
  styleUrl: './captcha-challenge.component.scss'
})
export class CaptchaChallengeComponent {
  captchaToken: string | null = null;
  baseurl = environment.apiUrlSimple

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  onCaptchaResolved(token: any) {
    this.captchaToken = token.toString();
  }

  submitCaptcha() {
    this.http.post(`${this.baseurl}/api/security/verify-captcha`, {
      captchaToken: this.captchaToken
    }).subscribe({
      next: () => {
        history.back();
      },
      error: () => {
        alert('CAPTCHA failed. Please try again.');
      }
    });
  }
}
