import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/support/auth.service';
import { WindowService } from '../../services/common/window.service';
import { AlertsService } from '../../services/support/alerts.service';

@Component({
  selector: 'app-landing',
  imports: [],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  private cookieService = inject(AuthService);
  private windowService = inject(WindowService);
  private alertService = inject(AlertsService);

  scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  login(profile: string, action: string) {
    if (this.cookieService.isExists()) {
      this.alertService.successMessage('You are already logged in', 'Great!');
      return;
    }
    const referrer = this.cookieService.getReferer();
    const platform = this.cookieService.getPlatform();
    const promo = this.cookieService.getPromotion();

    if (this.windowService.nativeDocument) {
      const aElm: HTMLAnchorElement = document.createElement('a');
      const currentUrl = window.location.origin + window.location.pathname;
      const redirectParams = new URLSearchParams({
        plat: platform,
        ref: referrer,
        prom: promo,
        rb: 'TRAINER',
        lv: '5',
      });

      const shortRedirectParams = new URLSearchParams({
        plat: platform,
        ref: referrer,
        prom: promo,
      });

      let finalRedirectParams = profile === 'trainer' ? redirectParams : shortRedirectParams;
      let finalRedirectUrl = `https://login.talnova.io/login?redirectUri=${currentUrl}?&${finalRedirectParams.toString()}`;
      if (action === 'login')
        finalRedirectUrl = `https://login.talnova.io/login?redirectUri=${currentUrl}?&${finalRedirectParams.toString()}`;
      else if (action === 'register')
        finalRedirectUrl = `https://login.talnova.io/register?redirectUri=${currentUrl}?&${finalRedirectParams.toString()}`;

      aElm.href = finalRedirectUrl;
      aElm.target = '_self';
      aElm.click();
    }
  }
}
