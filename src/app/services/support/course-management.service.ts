import { Injectable } from '@angular/core';
import {Observable, Subject, tap} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ResumeStorageService } from './resume-storage.service';
import { AlertsService } from './alerts.service';
import {CoursesService} from '../courses.service';
import {WindowService} from '../common/window.service';

@Injectable({
  providedIn: 'root',
})
export class CourseManagementService {
  private courseUpdated = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private courseService: CoursesService,
    private alertService: AlertsService,
    private windowService: WindowService,
    private resumeStorage: ResumeStorageService
  ) {}

  getCourseUpdateListener(): Observable<void> {
    return this.courseUpdated.asObservable();
  }

  deleteCourse(event: any): Observable<void> {
    return new Observable((observer) => {
      if (event) {
        if (confirm('Are you sure you want to delete this course?')) {
          this.courseService.deleteCourse(event).subscribe(() => {
            this.courseUpdated.next();
            this.alertService.successMessage('Course deleted successfully!', 'Success');
            observer.next();
            observer.complete();
          }, error => {
            this.alertService.errorMessage('Failed to delete course. Please try again.', 'Error');
            observer.error(error);
          });
        }
      } else {
        this.alertService.errorMessage('Failed to delete course. Please try again.', 'Error');
        observer.error('No course event provided');
      }
    });
  }

  editCourse(event: any): void {
    if (this.windowService.nativeSessionStorage) {
      sessionStorage.setItem('editCourse', event.id);
      this.resumeStorage.clearData();

      const basicDetails = {
        name: event.name,
        overview: event.overview,
        lecturer: event.lecturer,
        language: event.language,
        level: event.level,
        duration: event.duration,
        email: event.organizer,
        certificate: event.certificate,
        paymentMethod: event.paymentMethod // 'card' or 'bank'
      };
      const courseContent = event.description;
      const relevantDetails = {
        skills: event.skills,
        startDate: event.startDate,
        startTime: event.fromTime,
        endTime: event.toTime,
        coverImage: event.image,
        freeCheck: event.price === '0',
        currency: event.currency,
        price: event.price,
        mediaType: event.platform,
        location: event.location,
        category: event.category,
        courseStatus: event.courseStatus
      };
      const installment = event.installment;
      const modules = event.modules;

      this.resumeStorage.saveData('basicDetails', basicDetails);
      this.resumeStorage.saveData('courseContent', courseContent);
      this.resumeStorage.saveData('relevantDetails', relevantDetails);
      this.resumeStorage.saveData('installment', installment);
      this.resumeStorage.saveData('modules', modules);

      this.router.navigate(['/post-course']);
    }
  }

  toggleAudience(event: any): Observable<void> {
    if (!event) {
      this.alertService.errorMessage('Failed to update course. Please try again.', 'Error');
      return new Observable((observer) => observer.error('No course event provided'));
    }

    return this.courseService.toggleAudience(event).pipe(
      tap((data) => {
        this.courseUpdated.next();
        this.alertService.successMessage('Course updated successfully!', 'Success');
      })
    );
  }
}
