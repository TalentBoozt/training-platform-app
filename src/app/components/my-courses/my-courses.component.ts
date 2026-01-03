import { Component, OnDestroy, OnInit } from '@angular/core';
import { CoursesService } from '../../services/courses.service';
import { Subscription, tap } from 'rxjs';
import { AuthService } from '../../services/support/auth.service';
import { CourseCardComponent } from '../shared/cards/course-card/course-card.component';
import { NgForOf, NgIf } from '@angular/common';
import { CourseManagementService } from '../../services/support/course-management.service';
import { Card1x2LoaderComponent } from '../shared/cards/loaders/card1x2-loader/card1x2-loader.component';
import { Router } from '@angular/router';
import { CourseStoreService } from '../../services/cacheStates/course-store.service';
import { RecCoursesService } from '../../services/rec-courses.service';
import { AlertsService } from '../../services/support/alerts.service';
import { effect } from '@angular/core';

@Component({
  selector: 'app-my-courses',
  imports: [
    CourseCardComponent,
    NgForOf,
    NgIf,
    Card1x2LoaderComponent
  ],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.scss',
  standalone: true
})
export class MyCoursesComponent implements OnInit, OnDestroy {

  private courseSub!: Subscription;
  courses: any[] = [];
  companyId: any;
  loading: boolean = false;

  constructor(private courseService: CoursesService,
    private courseManagementService: CourseManagementService,
    private recCoursesService: RecCoursesService,
    private courseStore: CourseStoreService,
    private router: Router,
    private alertService: AlertsService,
    private cookieService: AuthService) {
    effect(() => {
      this.courses = this.courseStore.allCourses$();
      this.loading = this.courseStore.loading$();
    });
  }

  ngOnInit(): void {
    this.companyId = this.cookieService.organization();
    // Manual fetching removed, store handles it.
    // Ensure store is refreshed if needed, though Dashboard likely triggered it.
    if (!this.courseStore.allCourses$().length) {
      this.courseStore.refresh();
    }
  }

  ngOnDestroy() {
    if (this.courseSub) {
      this.courseSub.unsubscribe();
    }
  }

  // getAllCourses removed -> logic is in CourseStoreService now

  deleteCourse(event: any) {
    const course = this.courses.find(c => c.id === event || c._id === event);

    if (course?.courseType === 'recorded') {
      this.recCoursesService.deleteCourse(event).subscribe(
        () => {
          this.courseStore.refresh();
          this.alertService.successMessage('Recorded course deleted.', 'Success');
        },
        (error) => this.alertService.errorMessage(error.message, 'Error')
      );
    } else {
      this.courseManagementService.deleteCourse(event).subscribe(
        () => {
          this.courseStore.refresh();
          // Alert handled in service usually, or we can add here
        },
        (error) => {
          // Error handled
        }
      );
    }
  }

  editCourse(course: any) {
    if (course.courseType === 'recorded') {
      this.courseManagementService.editRecordedCourse(course);
    } else {
      this.courseManagementService.editCourse(course);
    }
  }

  navigateToMaterials($event: any) {
    this.router.navigate(['/manage-materials', $event]);
  }

  toggleAudience($event: any) {
    this.courseManagementService.toggleAudience($event).subscribe({
      next: () => {
        // do nothing -> handled by courseManagementService
      },
      error: (error) => {
        console.error('Error toggling audience', error);
      }
    });
  }
}
