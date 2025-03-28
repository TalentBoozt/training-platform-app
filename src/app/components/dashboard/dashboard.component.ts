import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {CourseCardComponent} from '../shared/cards/course-card/course-card.component';
import {RouterLink} from '@angular/router';
import {CoursesService} from '../../services/courses.service';
import {AuthService} from '../../services/support/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    NgForOf,
    CourseCardComponent,
    NgIf,
    RouterLink
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

  constructor(private courseService: CoursesService,
              private cookieService: AuthService) {
  }

  ngOnInit() {
    this.companyId = this.cookieService.organization();
    this.getCourses(this.companyId);
  }

  // Get Courses
  getCourses(id: string) {
    this.courseService.getCoursesByOrganization(id).subscribe(courses => {
      this.courseCards = courses;
      this.updateFilteredCourses();
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
}
