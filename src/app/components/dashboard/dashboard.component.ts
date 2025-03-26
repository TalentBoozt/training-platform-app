import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {CourseCardComponent} from '../shared/cards/course-card/course-card.component';
import {RouterLink} from '@angular/router';

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

  courseCards = [
    {
      id: 1,
      name: "Angular for Beginners",
      description: "<h2>Welcome to <strong>Angular for Beginners</strong>!</h2><p>Learn the fundamentals of Angular and start building dynamic web applications.</p><h3>What You Will Learn</h3><ul><li>Understanding Angular components and templates</li><li>Data binding and event handling</li><li>Building interactive UI with Angular</li></ul><h3>Course Overview</h3><p>In this course, you will learn the basics of Angular, including:</p><ol><li><strong>Introduction to Angular</strong> – What is Angular and why use it?</li><li><strong>Components and Templates</strong> – Learn how to create UI components.</li><li><strong>Data Binding</strong> – Connecting data between components and templates.</li></ol><h3>Course Details</h3><p><strong>Category:</strong> Web Development</p><p><strong>Organizer:</strong> Talent Boozt</p><p><strong>Level:</strong> Beginner</p><p><strong>Duration:</strong> 3 Hours</p><p><strong>Instructor:</strong> John Doe</p><p><strong>Platform:</strong> Zoom</p><h3>Skills You Will Gain</h3><ul><li>HTML, CSS, and TypeScript</li><li>Angular CLI & RxJS</li><li>State management with NgRx</li></ul><h3>Requirements</h3><ul><li>Basic knowledge of HTML and CSS</li><li>Basic understanding of JavaScript</li></ul><h3>Pricing & Installments</h3><p><strong>Full Price:</strong> $10.00</p><ul><li>First Installment: $5.00</li><li>Second Installment: $3.00</li><li>Third Installment: $2.00</li></ul><h3>Certificate</h3><p>✅ Yes! A certificate will be awarded upon completion.</p><h3>Course Schedule</h3><p><strong>Start Date:</strong> January 1, 2023</p><p><strong>Time:</strong> 10:00 AM - 12:00 PM</p>",
      overview: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.',
      category: "Web Development",
      organizer: "Talent Boozt",
      level: "beginner",
      price: 10.00,
      installment: [
        {
          id: 1,
          name: 'First Installment',
          currency: 'LKR',
          price: 5000.00,
          paymentLink: 'https://www.paypal.com/donate',
          paid: true
        },
        {
          id: 2,
          name: 'Second Installment',
          currency: 'LKR',
          price: 5000.00,
          paymentLink: 'https://www.paypal.com/donate',
          paid: false
        },
        {
          id: 3,
          name: 'Third Installment',
          currency: 'LKR',
          price: 4000.00,
          paymentLink: 'https://www.paypal.com/donate',
          paid: false
        }
      ],
      duration: "3 hours",
      modules: [
        {
          name: 'Introduction to Angular',
          duration: '1 hour',
          installmentId: 1,
          date: '2025-03-30',
          start: '08.00PM',
          end: '10.00PM',
          meetingLink: '',
          status: 'upcoming'
        },
        {
          name: 'Components and Templates',
          duration: '1 hour',
          installmentId: 2,
          date: '2025-04-06',
          start: '08.00PM',
          end: '10.00PM',
          meetingLink: '',
          status: 'upcoming'
        },
        {
          name: 'Data Binding',
          duration: '1 hour',
          installmentId: 3,
          date: '2025-04-13',
          start: '08.00PM',
          end: '10.00PM',
          meetingLink: '',
          status: 'upcoming'
        }
      ],
      rating: 4.5,
      language: "English",
      lecturer: "John Doe",
      image: "",
      skills: ["HTML", "CSS", "TypeScript", "Angular CLI", "RxJS", "NgRx"],
      requirements: ["Basic knowledge of HTML and CSS", "Basic knowledge of JavaScript"],
      certificate: true,
      platform: "zoom",
      startDate: "2023-01-01",
      fromTime: "10:00 AM",
      toTime: "12:00 PM",
      courseStatus: "upcoming",
    }
  ];
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

  ngOnInit() {
    this.updateFilteredCourses();
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
