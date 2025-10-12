import {Component, inject} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {NgIf} from '@angular/common';
import {AuthService} from '../../../services/support/auth.service';

@Component({
  selector: 'app-rec-course-iframe',
  imports: [
    NgIf
  ],
  templateUrl: './rec-course-iframe.component.html',
  styleUrl: './rec-course-iframe.component.scss',
  standalone: true
})
export class RecCourseIframeComponent {
  iframeUrl: SafeResourceUrl;
  iframeLoaded = false;

  private cookieService = inject(AuthService);
  userId: any;
  companyId: any;

  constructor(private sanitizer: DomSanitizer) {
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://course-wizard.netlify.app/getting-start?embedded=true&usr=${this.userId}&comp=${this.companyId}`
    );
  }

  ngOnInit() {
    this.userId = this.cookieService.userID();
    this.companyId = this.cookieService.organization();
  }

  onIframeLoad() {
    setTimeout(() => {
      this.iframeLoaded = true;
    },100);
  }

  openInNewTab() {
    window.open(`https://course-wizard.netlify.app/getting-start?usr=${this.userId}&comp=${this.companyId}`, '_blank');
  }
}
