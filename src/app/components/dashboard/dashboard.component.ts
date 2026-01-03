
import { Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild, effect, inject, runInInjectionContext } from '@angular/core';
import { DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { CourseCardComponent } from '../shared/cards/course-card/course-card.component';
import { Router, RouterLink } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { RecCoursesService } from '../../services/rec-courses.service';
import { CourseStoreService } from '../../services/cacheStates/course-store.service';
import { AlertsService } from '../../services/support/alerts.service';
import { ResumeStorageService } from '../../services/support/resume-storage.service';
import { Subscription } from 'rxjs';
import { CourseManagementService } from '../../services/support/course-management.service';
import { Card1x2LoaderComponent } from '../shared/cards/loaders/card1x2-loader/card1x2-loader.component';
import { CardFullLoaderComponent } from '../shared/cards/loaders/card-full-loader/card-full-loader.component';
import { EmployeeAuthStateService } from '../../services/cacheStates/employee-auth-state.service';

import { utcToZonedTime, format } from 'date-fns-tz';

@Component({
  selector: 'app-dashboard',
  imports: [
    NgForOf,
    CourseCardComponent,
    NgIf,
    RouterLink,
    DecimalPipe,
    Card1x2LoaderComponent,
    CardFullLoaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('skillsContainer', { static: false }) skillsContainer!: ElementRef;

  private courseSub!: Subscription;
  private courseStore = inject(CourseStoreService);

  courses = [
    { name: 'All', category: 'All' },
    { name: 'Ongoing', category: 'ongoing' },
    { name: 'Upcoming', category: 'upcoming' },
    { name: 'Completed', category: 'completed' }
  ];

  selectedCategory: string = 'All';

  courseCards: any[] = [];
  quickLinks: any[] = [
    {
      id: 1,
      title: 'Post a Course',
      icon: 'add',
      link: '/post-course'
    },
    {
      id: 2,
      title: 'My Courses',
      icon: 'book',
      link: '/my-courses'
    }
  ];
  filteredCourses: any[] = [];
  filteredUpcomingCourses: any[] = [];

  companyId: string = '';

  overview: any = {
    hours: 0,
    inProgress: 0,
    completed: 0,
    participants: 0
  }

  loading: boolean = true;
  o_loading: boolean = true;
  u_loading: boolean = true;

  constructor(
    injector: Injector,
    private courseService: CoursesService,
    private recCoursesService: RecCoursesService,
    private authState: EmployeeAuthStateService,
    private courseManagementService: CourseManagementService,
    private resumeStorage: ResumeStorageService,
    private router: Router,
    private alertService: AlertsService) {
    runInInjectionContext(injector, () => {
      effect(() => {
        const courses = this.courseStore.allCourses$();
        const loading = this.courseStore.loading$();

        this.loading = loading;
        if (!loading) {
          this.courseCards = courses;
          this.updateFilteredCourses();
        }
      });
    });
  }

  ngOnInit() {
    this.companyId = this.authState.currentUser?.employee?.companyId || '';

    // Listen for manual updates
    this.courseSub = this.courseManagementService
      .getCourseUpdateListener()
      .subscribe(() => {
        if (this.authState.currentUser?.employee?.companyId) {
          this.courseStore.refresh();
        }
      });

    // Auth state listener for local overview - Store handles courses itself now
    this.authState.employee$.subscribe(profile => {
      const companyId = profile?.employee?.companyId;
      if (companyId) {
        this.companyId = companyId;
        this.getOverview(companyId);
      }
    });
  }

  ngOnDestroy() {
    if (this.courseSub) {
      this.courseSub.unsubscribe();
    }
  }

  // Get Courses - Deprecated direct call, now handled by Store
  getCourses(id: string) {
    this.courseStore.refresh();
  }

  getOverview(id: string) {
    this.courseService.getOverviewByCompany(id).subscribe(overview => {
      this.overview = {
        hours: overview.totalTrainingHours / 60,
        inProgress: overview.totalInProgressTrainings,
        completed: overview.totalCompletedTrainings,
        participants: overview.totalParticipants
      }
      this.o_loading = false;
    });
  }

  // Select Category & Reset Skill Filter
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.updateFilteredCourses();
  }

  // Update Filtered Courses Based on Category, Skill, and Sorting
  updateFilteredCourses() {
    // Filter by Category
    this.filteredCourses = this.selectedCategory === 'All'
      ? [...this.courseCards]
      : this.courseCards.filter(course => course.courseStatus === this.selectedCategory);

    this.filteredUpcomingCourses = this.courseCards.filter(course => course.courseStatus === 'upcoming');
    this.u_loading = false;
  }

  deleteCourse(event: any) {
    const course = this.courseCards.find(c => c.id === event || c._id === event);

    if (course?.courseType === 'recorded') {
      this.recCoursesService.deleteCourse(event).subscribe(
        () => {
          this.courseStore.refresh();
          this.alertService.successMessage('Recorded course deleted successfully.', 'Success');
        },
        (error) => {
          this.alertService.errorMessage(error.message, 'Error');
        }
      );
    } else {
      this.courseManagementService.deleteCourse(event).subscribe(
        () => {
          this.courseStore.refresh();
          this.alertService.successMessage('Course deleted successfully.', 'Success');
        },
        (error) => {
          this.alertService.errorMessage(error.message, 'Error');
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

  openMaterials($event: any) {
    this.router.navigate(['/manage-materials', $event]);
  }

  toggleAudience($event: any) {
    this.courseManagementService.toggleAudience($event).subscribe({
      next: () => {
        // do nothing -> handled by courseManagementService
      },
      error: (error) => {
        this.alertService.errorMessage(error.message, 'Error');
      }
    });
  }
}
