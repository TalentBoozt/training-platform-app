import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {NgForOf, NgIf} from '@angular/common';
import {ResumeStorageService} from '../../../services/support/resume-storage.service';

@Component({
  selector: 'app-preview-post',
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './preview-post.component.html',
  styleUrl: './preview-post.component.scss',
  standalone: true
})
export class PreviewPostComponent implements OnInit{
  selectedCourse: any[] = [];
  isNotFound: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private resumeStorage: ResumeStorageService,
    private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.getCourseDetails();
  }

  getCourseDetails() {
    const savedData = this.resumeStorage.getData();
    if (savedData && Object.keys(savedData).length > 0){
      this.isNotFound = false;
      const course = {
        name: savedData.basicDetails.name,
        overview: savedData.basicDetails.overview,
        lecturer: savedData.basicDetails.lecturer,
        rating: '4.5',
        language: savedData.basicDetails.language,
        level: savedData.basicDetails.level,
        duration: savedData.basicDetails.duration,
        skills: savedData.relevantDetails.skills,
        modules: savedData.modules,
        description: savedData.courseContent
      }
      this.selectedCourse.push(course);
    } else {
      this.isNotFound = true;
    }
  }

  sanitizeHTML(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
