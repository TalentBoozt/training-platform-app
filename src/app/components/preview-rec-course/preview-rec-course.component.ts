import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertsService } from '../../services/support/alerts.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgForOf, NgIf } from '@angular/common';
import { RecCoursesService } from '../../services/rec-courses.service';
import { CoursePreviewLoaderComponent } from '../shared/cards/loaders/course-preview-loader/course-preview-loader.component';

@Component({
    selector: 'app-preview-rec-course',
    imports: [
        NgForOf,
        NgIf,
        CoursePreviewLoaderComponent
    ],
    templateUrl: './preview-rec-course.component.html',
    styleUrl: './preview-rec-course.component.scss',
    standalone: true
})
export class PreviewRecCourseComponent implements OnInit {

    courseId: any;
    course: any;
    loading = false;

    constructor(
        private recCoursesService: RecCoursesService,
        private route: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private alertService: AlertsService
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.courseId = params.get('courseId');
            if (this.courseId) {
                this.getCourseDetails(this.courseId);
            }
        });
    }

    getCourseDetails(courseId: any) {
        this.loading = true;
        this.recCoursesService.getCourseById(courseId).subscribe({
            next: (response: any) => {
                // Ensure response is array or object, template expects array loop or direct object access? 
                // PreviewCourseComponent uses *ngFor="let c of course" where course is [response]. 
                // I'll stick to that pattern for consistency if reusing HTML structure heavily.
                this.course = [response];
                this.loading = false;
            },
            error: (error) => {
                this.alertService.errorMessage(error.error?.message || 'Failed to load course', 'Error');
                this.loading = false;
            }
        });
    }

    sanitizeHTML(html: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(html || '');
    }
}
