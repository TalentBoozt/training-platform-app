import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './components/shared/header/header.component';
import {AuthService} from './services/support/auth.service';
import {LockScreenComponent} from './components/authenticating/lock-screen/lock-screen.component';
import {LoginComponent} from './components/authenticating/login/login.component';
import {RegisterComponent} from './components/authenticating/register/register.component';
import {ResetPasswordComponent} from './components/authenticating/reset-password/reset-password.component';
import {NgClass, NgIf} from '@angular/common';
import {ThemeService} from './services/support/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NgIf, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent implements OnInit {
  title = 'training-platform-app';

  showNavbar = true;
  showFooter = true;

  constructor(private route: ActivatedRoute,
              private cookieService: AuthService,
              public themeService: ThemeService) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const platform = params['platform'] || 'TrainingPlatform';
      const ref = params['ref'] || '';
      const promo = params['promo'] || '';
      this.cookieService.createPlatform(platform);
      this.cookieService.createReferer(ref);
      this.cookieService.createPromotion(promo);
    });
  }

  toggleCommonComponent(component: any) {
    if (component instanceof LockScreenComponent) {
      this.showNavbar = false;
      this.showFooter = false;
    } else if (component instanceof LoginComponent) {
      this.showNavbar = false;
      this.showFooter = false;
    } else if (component instanceof RegisterComponent) {
      this.showNavbar = false;
      this.showFooter = false;
    } else if (component instanceof ResetPasswordComponent) {
      this.showNavbar = false;
      this.showFooter = false;
    } else {
      this.showNavbar = true;
      this.showFooter = true;
    }
  }
}
