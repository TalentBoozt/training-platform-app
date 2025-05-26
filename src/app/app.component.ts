import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {HeaderComponent} from './components/shared/header/header.component';
import {AuthService} from './services/support/auth.service';
import {LockScreenComponent} from './components/authenticating/lock-screen/lock-screen.component';
import {LoginComponent} from './components/authenticating/login/login.component';
import {RegisterComponent} from './components/authenticating/register/register.component';
import {ResetPasswordComponent} from './components/authenticating/reset-password/reset-password.component';
import {NgClass, NgIf} from '@angular/common';
import {ThemeService} from './services/support/theme.service';
import {WindowService} from './services/common/window.service';
import {CommonService} from './services/common/common.service';
import {AlertsService} from './services/support/alerts.service';
import {LoginService} from './services/common/login.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NgIf, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'training-platform-app';

  showNavbar = true;
  showFooter = true;

  employee: any;
  employeeId: any;
  employeeLevel: any;

  isCookiesAccepted: boolean = false;

  constructor(private route: ActivatedRoute,
              private commonService: CommonService,
              private loginService: LoginService,
              private windowService: WindowService,
              private cookieService: AuthService,
              private alertService: AlertsService,
              public themeService: ThemeService) {
  }

  async ngOnInit(): Promise<void> {
    if (
      this.windowService.nativeDocument &&
      this.windowService.nativeSessionStorage &&
      this.windowService.nativeLocalStorage
    ) {
      this.fetchTokensFromLogin();

      try {
        await this.autoLogin();
      } catch {
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

          aElm.href = `https://login.talentboozt.com/login?redirectUri=${encodeURIComponent(currentUrl + '?' + redirectParams.toString())}`;
          aElm.target = '_self';
          aElm.click();
        }
      }

      this.route.queryParams.subscribe(params => {
        const platform = params['platform'] || 'TrainerPlatform';
        const ref = params['ref'] || '';
        const promo = params['promo'] || '';
        this.cookieService.createPlatform(platform);
        this.cookieService.createReferer(ref);
        this.cookieService.createPromotion(promo);
      });

      this.employeeId = this.cookieService.userID();
      this.employeeLevel = this.cookieService.level();
      this.themeService.applyTheme();

      this.isAcceptCookies();
    }
  }

  ngAfterViewInit() {
    if(this.windowService.nativeDocument){
      const icons = document.querySelectorAll('.material-icons');
      icons.forEach((icon) => {
        icon.setAttribute('translate', 'no');
      });
    }

    this.markAttendance()
  }

  ngOnDestroy() {
    this.removeUnwantedSession()
  }

  autoLogin(): Promise<boolean> {
    const alreadyInitialized = sessionStorage.getItem('sso-initialized');
    if (alreadyInitialized) {
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      this.commonService.getSession().subscribe({
        next: (userData) => {
          this.cookieService.createUserID(userData.employeeId);
          this.cookieService.createLevel(userData.userLevel);
          this.cookieService.unlock();

          userData.organizations?.forEach((organization: any) => {
            this.cookieService.createOrganizationID(organization.TrainerPlatform || '');
          });

          this.commonService.getTokens(userData.email).subscribe((tokens) => {
            this.cookieService.createAuthToken(tokens.accessToken);
            this.cookieService.createRefreshToken(tokens.refreshToken);
            if (this.windowService.nativeSessionStorage)
              sessionStorage.setItem('sso-initialized', 'true');
            resolve(true);
          });
        },
        error: () => {
          this.alertService.successMessage('Claim your free account today!', 'Talent Boozt ✨');
          reject();
        }
      });
    });
  }

  fetchTokensFromLogin(): void {
    if (this.windowService.nativeWindow) {
      const rawQuery = window.location.search;
      const params = new URLSearchParams(rawQuery);

      const accessToken = params.get('auth');
      const refreshToken = params.get('reft');

      if (accessToken && refreshToken) {
        this.cookieService.createAuthToken(accessToken);
        this.cookieService.createRefreshToken(refreshToken);

        // Clean the URL to prevent re-triggering
        params.delete('auth');
        params.delete('reft');
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }

  markAttendance() {
    if (this.windowService.nativeDocument) {
      const meta = {
        referrer: this.cookieService.getReferer(),
        platform: this.cookieService.getPlatform(),
        promotion: this.cookieService.getPromotion(),
        provider: document.referrer,
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages.join(', '),  // A comma-separated string of preferred languages
        platformDetails: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,  // Number of logical processor cores
        deviceMemory: 0,  // Available memory in GB
        cookiesEnabled: navigator.cookieEnabled,  // Whether cookies are enabled
        onlineStatus: navigator.onLine,  // Whether the browser is online
        location: { latitude: 0, longitude: 0 },
      };

      // If device memory is available, collect it
      if ("deviceMemory" in navigator) {
        meta.deviceMemory = navigator.deviceMemory as number;
      }

      // If geolocation is available and allowed, collect it
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            meta.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            this.recordLogin(meta);  // Continue the login process with geolocation
          },
          (error) => {
            console.error("Geolocation permission denied or failed", error);
            this.recordLogin(meta);  // Proceed with the login process even if geolocation fails
          }
        );
      } else {
        this.recordLogin(meta);  // Proceed without geolocation if not available
      }
    }
  }

  private recordLogin(meta: any) {
    if (this.employeeId) {
      this.loginService.recordLogin(this.employeeId, meta).subscribe(data => {
        this.alertService.successMessage('Good to see you back :)', 'Welcome');
      }, error => {
        // Handle error (maybe show an alert to the user)
      });
    } else {
      this.loginService.recordLogin('unknown', meta).subscribe(data => {
        this.alertService.successMessage('Hey there :)', 'Welcome');
      }, error => {
        // Handle error (maybe show an alert to the user)
      });
    }
  }

  isAcceptCookies() {
    if (this.cookieService.isCookiesAccepted()) {
      this.isCookiesAccepted = true;
    }
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

  removeUnwantedSession() {
    if (this.windowService.nativeSessionStorage) {
      sessionStorage.clear();
    }
  }

  acceptCookies() {
    this.cookieService.acceptAllCookies();
    this.isCookiesAccepted = true;
  }
}
