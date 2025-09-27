import {Component, inject} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {NgIf} from '@angular/common';

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

  constructor(private sanitizer: DomSanitizer) {
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://course-wizard.netlify.app/?embedded=true'
    );
  }

  onIframeLoad() {
    setTimeout(() => {
      this.iframeLoaded = true;
    },100);
  }

  openInNewTab() {
    window.open('https://course-wizard.netlify.app/', '_blank');
  }
}
