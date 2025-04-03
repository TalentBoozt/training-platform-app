import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {ThemeService} from '../../../services/support/theme.service';
import {HttpErrorResponse} from '@angular/common/http';
import {AlertsService} from '../../../services/support/alerts.service';
import {AuthService} from '../../../services/support/auth.service';
import {EmployeeService} from '../../../services/employee.service';
import {CredentialService} from '../../../services/credential.service';
import {LinkedInAuthService} from '../../../services/authentication/linked-in-auth.service';
import {WindowService} from '../../../services/common/window.service';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    NgIf,
    NgForOf
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

  employee: any;
  employeeId: any;
  isTokenFound: boolean = false;

  constructor(public themeService: ThemeService,
              private router: Router,
              private renderer: Renderer2,
              private employeeService: EmployeeService,
              private credentialsService: CredentialService,
              private linkedInAuthService: LinkedInAuthService,
              private windowService: WindowService,
              private alertService: AlertsService,
              private cookieService: AuthService) {
  }

  ngOnInit() {
    this.employeeId = this.cookieService.userID();
    this.isTokenFound = this.cookieService.isRefreshToken();
    this.themeService.applyTheme();
    if (this.windowService.nativeWindow && this.windowService.nativeDocument) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          // Logic to update active class based on the current route
          this.updateActiveClass();

          const mainBody = document.querySelector('.main-body');
          if (mainBody) {
            mainBody.scrollTop = 0;
          } else {
            window.scrollTo(0, 0);
          }
        }
      });
    }

    if (this.employeeId){
      this.getEmployee(this.employeeId);
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

  getEmployee(id: any) {
    this.employeeService.getEmployee(id).subscribe(
      (data) => {
        this.employee = data;
      },
      (error: HttpErrorResponse) => {
        console.log(error)
      }
    );
  }

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
      this.filteredSearchResults = this.commonSearchResults
    }
    return this.filteredSearchResults;
  }

  handleSearch(data: any) {
    this.openSearchResults = !this.openSearchResults;
    this.targetInput = data as HTMLInputElement;
    const value = this.targetInput.value
    if (value) {
      this.filteredSearchResults = this.commonSearchResults.filter((data: any) =>
        data.name.toLowerCase().includes(value.toLowerCase())
      );
    } else {
      this.filteredSearchResults = this.commonSearchResults;
    }
  }

  removeUnwantedSession() {
    if (this.windowService.nativeSessionStorage)
      sessionStorage.clear();
  }

  logout() {
    this.cookieService.logout()
    this.removeUnwantedSession()
    this.linkedInAuthService.logoutFromLinkedIn().then(r => {});
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
