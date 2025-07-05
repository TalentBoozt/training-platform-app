import {Component, OnDestroy, OnInit} from '@angular/core';
import {CoursesService} from '../../services/courses.service';
import {Subscription, tap} from 'rxjs';
import {AuthService} from '../../services/support/auth.service';
import {CourseCardComponent} from '../shared/cards/course-card/course-card.component';
import {NgForOf, NgIf} from '@angular/common';
import {CourseManagementService} from '../../services/support/course-management.service';
import {Card1x2LoaderComponent} from '../shared/cards/loaders/card1x2-loader/card1x2-loader.component';
import {Router} from '@angular/router';
import {format, utcToZonedTime} from 'date-fns-tz';

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
              private router: Router,
              private cookieService: AuthService) {}

  ngOnInit(): void {
    this.companyId = this.cookieService.organization();
    this.courseSub = this.courseManagementService
      .getCourseUpdateListener()
      .subscribe(() => {
        this.getAllCourses().subscribe();
      });
    this.getAllCourses().subscribe(() => this.loading = false);
  }

  ngOnDestroy() {
    if (this.courseSub) {
      this.courseSub.unsubscribe();
    }
  }

  getAllCourses() {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.loading = true;
    return this.courseService.getCoursesByOrganization(this.companyId).pipe(
      tap((courses: any) => {
        this.courses = courses.map((course: any) => {
          const startLocal = utcToZonedTime(course.utcStart, userTimezone);
          const endLocal = utcToZonedTime(course.utcEnd, userTimezone);

          return {
            ...course,
            startDate: format(startLocal, 'yyyy-MM-dd', { timeZone: userTimezone }),
            fromTime: format(startLocal, 'HH:mm', { timeZone: userTimezone }),
            toTime: format(endLocal, 'HH:mm', { timeZone: userTimezone }),
          };
        });
      })
    )
  }

  deleteCourse(event: any) {
    this.courseManagementService.deleteCourse(event).subscribe(
      () => {
        this.getAllCourses().subscribe();
      },
      (error) => {
        // Handle error if needed
      }
    );
  }

  editCourse(event: any) {
    this.courseManagementService.editCourse(event);
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
