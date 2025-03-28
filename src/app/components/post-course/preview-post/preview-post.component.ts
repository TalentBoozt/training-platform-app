import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {NgForOf, NgIf} from '@angular/common';
import {ResumeStorageService} from '../../../services/support/resume-storage.service';
import {CoursesService} from '../../../services/courses.service';
import {AlertsService} from '../../../services/support/alerts.service';
import {AuthService} from '../../../services/support/auth.service';

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
  companyId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cookieService: AuthService,
    private resumeStorage: ResumeStorageService,
    private courseService: CoursesService,
    private alertService: AlertsService,
    private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.getCourseDetails();
    this.companyId = this.cookieService.organization();
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

  addCourse() {
    const savedData = this.resumeStorage.getData();
    if (savedData && Object.keys(savedData).length > 0){
      const course = {
        companyId: this.companyId || 'unknown',
        name: savedData.basicDetails.name,
        description: savedData.courseContent,
        overview: savedData.basicDetails.overview,
        category: "",
        organizer: savedData.basicDetails.email,
        level: savedData.basicDetails.level,
        currency: savedData.relevantDetails.currency,
        price: savedData.relevantDetails.price,
        installment: savedData.installment,
        duration: savedData.basicDetails.duration,
        modules: savedData.modules,
        rating: "",
        language: savedData.basicDetails.language,
        lecturer: savedData.basicDetails.lecturer,
        image: savedData.relevantDetails.coverImage,
        skills: savedData.relevantDetails.skills,
        certificate: "",
        platform: savedData.relevantDetails.mediaType,
        location: savedData.relevantDetails.location,
        startDate: savedData.relevantDetails.startDate,
        fromTime: savedData.relevantDetails.startTime,
        toTime: savedData.relevantDetails.endTime
      }

      this.courseService.addCourse(course).subscribe(() => {
        this.router.navigate(['/courses']);
        this.alertService.successMessage('Course added successfully', 'Success');
      }, error => {
        this.alertService.errorMessage(error.error.message, 'Error');
      });
    }
    else {
      this.alertService.errorMessage('Not enough data found to add course', 'Error');
    }
  }
}
