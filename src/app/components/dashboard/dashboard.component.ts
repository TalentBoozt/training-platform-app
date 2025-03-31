import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {CourseCardComponent} from '../shared/cards/course-card/course-card.component';
import {Router, RouterLink} from '@angular/router';
import {CoursesService} from '../../services/courses.service';
import {AuthService} from '../../services/support/auth.service';
import {AlertsService} from '../../services/support/alerts.service';
import {WindowService} from '../../services/common/window.service';
import {ResumeStorageService} from '../../services/support/resume-storage.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    NgForOf,
    CourseCardComponent,
    NgIf,
    RouterLink,
    DecimalPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true
})
export class DashboardComponent implements OnInit{
  @ViewChild('skillsContainer', { static: false }) skillsContainer!: ElementRef;

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

  constructor(private courseService: CoursesService,
              private resumeStorage: ResumeStorageService,
              private alertService: AlertsService,
              private router: Router,
              private windowService: WindowService,
              private cookieService: AuthService) {
  }

  ngOnInit() {
    this.companyId = this.cookieService.organization();
    this.getCourses(this.companyId);
    this.getOverview(this.companyId);
  }

  // Get Courses
  getCourses(id: string) {
    this.courseService.getCoursesByOrganization(id).subscribe(courses => {
      this.courseCards = courses;
      this.updateFilteredCourses();
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
  }

  deleteCourse(event: any) {
    if (event) {
      if (confirm('Are you sure you want to delete this course?')) {
        this.courseService.deleteCourse(event).subscribe(() => {
          this.getCourses(this.companyId);
          this.alertService.successMessage('Course deleted successfully!', 'Success');
        }, error => {
          this.alertService.errorMessage('Failed to delete course. Please try again.', 'Error');
        });
      }
    } else {
      this.alertService.errorMessage('Failed to delete course. Please try again.', 'Error');
    }
  }

  editCourse(event: any) {
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
}
