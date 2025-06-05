import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {CourseCardComponent} from '../shared/cards/course-card/course-card.component';
import {RouterLink} from '@angular/router';
import {CoursesService} from '../../services/courses.service';
import {AlertsService} from '../../services/support/alerts.service';
import {ResumeStorageService} from '../../services/support/resume-storage.service';
import {Subscription} from 'rxjs';
import {CourseManagementService} from '../../services/support/course-management.service';
import {Card1x2LoaderComponent} from '../shared/cards/loaders/card1x2-loader/card1x2-loader.component';
import {CardFullLoaderComponent} from '../shared/cards/loaders/card-full-loader/card-full-loader.component';
import {EmployeeAuthStateService} from '../../services/cacheStates/employee-auth-state.service';

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

  constructor(private courseService: CoursesService,
              private authState: EmployeeAuthStateService,
              private courseManagementService: CourseManagementService,
              private resumeStorage: ResumeStorageService,
              private alertService: AlertsService) {
  }

  ngOnInit() {
    this.companyId = this.authState.currentUser?.employee?.companyId || '';
    this.courseSub = this.courseManagementService
      .getCourseUpdateListener()
      .subscribe(() => {
        if (this.authState.currentUser?.employee?.companyId) {
          this.getCourses(this.authState.currentUser.employee.companyId);
        }
      });
    this.authState.employee$.subscribe(profile => {
      const companyId = profile?.employee?.companyId;
      if (companyId) {
        this.getCourses(companyId);
        this.getOverview(companyId);
      }
    });
  }

  ngOnDestroy() {
    if (this.courseSub) {
      this.courseSub.unsubscribe();
    }
  }

  // Get Courses
  getCourses(id: string) {
    this.courseService.getCoursesByOrganization(id).subscribe(courses => {
      this.courseCards = courses;
      this.updateFilteredCourses();
      this.loading = false;
    });
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
    this.courseManagementService.deleteCourse(event).subscribe(
      () => {
        this.getCourses(this.companyId);
        this.alertService.successMessage('Course deleted successfully.', 'Success');
      },
      (error) => {
        this.alertService.errorMessage(error.message, 'Error');
      }
    );
  }

  editCourse(event: any) {
    this.courseManagementService.editCourse(event);
  }
}
