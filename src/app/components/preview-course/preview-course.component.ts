import {Component, OnInit} from '@angular/core';
import {CoursesService} from '../../services/courses.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {AlertsService} from '../../services/support/alerts.service';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {NgForOf, NgIf} from '@angular/common';
import {
  CoursePreviewLoaderComponent
} from '../shared/cards/loaders/course-preview-loader/course-preview-loader.component';

@Component({
  selector: 'app-preview-course',
  imports: [
    NgForOf,
    RouterLink,
    CoursePreviewLoaderComponent,
    NgIf
  ],
  templateUrl: './preview-course.component.html',
  styleUrl: './preview-course.component.scss',
  standalone: true
})
export class PreviewCourseComponent implements OnInit{

  courseId: any
  course: any

  loading = false

  constructor(private courseService: CoursesService,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private alertService: AlertsService ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('courseId');
      if (this.courseId) {
        this.getCourseDetails(this.courseId);
      }
    });
  }

  getCourseDetails(courseId: any) {
    if (courseId){
      this.loading = true
      this.courseService.getCourseById(courseId).subscribe((response: any) => {
        this.course = [response];
        this.loading = false
      }, (error) => {
        this.alertService.errorMessage(error.error.message, 'Error');
        this.loading = false
      })
    }
  }

  sanitizeHTML(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
