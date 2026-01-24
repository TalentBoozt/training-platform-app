import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { ThemeService } from '../../../services/support/theme.service';
import { AlertsService } from '../../../services/support/alerts.service';
import { AuthService } from '../../../services/support/auth.service';
import { LinkedInAuthService } from '../../../services/authentication/linked-in-auth.service';
import { WindowService } from '../../../services/common/window.service';
import { CoursesService } from '../../../services/courses.service';
import { tap } from 'rxjs';
import { CommonService } from '../../../services/common/common.service';
import { EmployeeProfile } from '../../../shared/data-models/cache/EmployeeProfile.model';
import { EmployeeAuthStateService } from '../../../services/cacheStates/employee-auth-state.service';
import { CourseStoreService } from '../../../services/cacheStates/course-store.service';
import { effect } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    NgIf,
    NgForOf,
    AsyncPipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true
})
export class HeaderComponent implements OnInit, AfterViewInit {

  @ViewChild('navbarNav') navbarNav: ElementRef | any;

  openSearchResults = false;
  commonSearchResults: any[] = [];
  filteredSearchResults: any[] = [];
  targetInput: any;

  employeeProfile: EmployeeProfile | null = null;

  isScrolled = false;
  isMobileMenuOpen = false;

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private renderer: Renderer2,
    private commonService: CommonService,
    private coursesService: CoursesService,
    private linkedInAuthService: LinkedInAuthService,
    private windowService: WindowService,
    private alertService: AlertsService,
    private cookieService: AuthService,
    public authState: EmployeeAuthStateService,
    private courseStore: CourseStoreService
  ) {
    effect(() => {
      this.commonSearchResults = this.courseStore.allCourses$();
    });
  }

  ngOnInit() {
    this.themeService.applyTheme();

    this.authState.employee$.subscribe(profile => {
      this.employeeProfile = profile;
    });

    if (this.windowService.nativeWindow && this.windowService.nativeDocument) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.updateActiveClass();
          const mainBody = document.querySelector('.main-body');
          mainBody ? (mainBody.scrollTop = 0) : window.scrollTo(0, 0);
          this.isMobileMenuOpen = false;
        }
      });

      window.addEventListener('scroll', () => {
        this.isScrolled = window.scrollY > 20;
      });
    }

    this.authState.employee$.subscribe((profile) => {
      if (profile?.employee?.id) {
        // Search results now come from the store, which is already initialized by Dashboard or app init
        // We can just rely on the store's signal
        effect(() => {
          this.commonSearchResults = this.courseStore.allCourses$();
        });
      }
    });
  }

  ngAfterViewInit() {
    if (this.windowService.nativeDocument) {
      const icons = document.querySelectorAll('.material-icons');
      icons.forEach((icon) => icon.setAttribute('translate', 'no'));
    }
  }

  // getCourses is no longer needed as we use the store
  // getCourses(companyId: any) { ... }

  updateActiveClass() {
    const currentRoute = this.router.url;

    if (this.windowService.nativeDocument) {
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });

      const activeLink = document.querySelector(`.nav-link[href="${currentRoute}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  }

  isActive(s: string) {
    return this.router.url === s;
  }

  collapseNavbar() {
    const navbar = this.navbarNav.nativeElement;
    if (navbar.classList.contains('show')) {
      this.renderer.removeClass(navbar, 'show');
    }
  }

  filterSearchResults(): any[] {
    if (this.targetInput === undefined) {
      this.filteredSearchResults = this.commonSearchResults;
    }
    return this.filteredSearchResults;
  }

  handleSearch(data: any) {
    this.targetInput = data as HTMLInputElement;
    const value = this.targetInput.value;
    if (value) {
      this.openSearchResults = true;
      this.filteredSearchResults = this.commonSearchResults.filter((data: any) =>
        data.name.toLowerCase().includes(value.toLowerCase())
      );
    } else {
      this.openSearchResults = false;
      this.filteredSearchResults = this.commonSearchResults;
    }
  }

  removeUnwantedSession() {
    if (this.windowService.nativeSessionStorage) {
      sessionStorage.clear();
    }
  }

  logout() {
    this.commonService.logout().subscribe(() => {
      this.cookieService.logout();
      this.removeUnwantedSession();
      this.authState.clearUser();
      this.linkedInAuthService.logoutFromLinkedIn().then(() => { });
      this.alertService.successMessage('You have been logged out successfully.', 'Success');
    });
  }

  login(profile: string, action: string) {
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

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  navigateToSearchResult(course: any) {
    if (course.courseType === 'recorded') {
      this.router.navigate(['/preview-rec', course.id || course._id]);
    } else {
      this.router.navigate(['/preview', course.id || course._id]);
    }
  }
}
