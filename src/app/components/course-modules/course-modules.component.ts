import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {ModuleCardComponent} from "../shared/cards/module-card/module-card.component";
import {WindowService} from '../../services/common/window.service';
import {CoursesService} from '../../services/courses.service';
import {AlertsService} from '../../services/support/alerts.service';
import {AuthService} from '../../services/support/auth.service';
import {EmployeeService} from '../../services/employee.service';
import {
  CoursePreviewLoaderComponent
} from '../shared/cards/loaders/course-preview-loader/course-preview-loader.component';

@Component({
  selector: 'app-course-modules',
  imports: [
    NgForOf,
    NgIf,
    ModuleCardComponent,
    NgClass,
    CoursePreviewLoaderComponent
  ],
  templateUrl: './course-modules.component.html',
  styleUrl: './course-modules.component.scss',
  standalone: true
})
export class CourseModulesComponent implements OnInit{
  courseId: any;
  selectedCourse: any[] = [];

  currentModule: any;
  currentInstallment: any;

  loading: boolean = false;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private courseService: CoursesService,
              private employeeService: EmployeeService,
              private alertService: AlertsService,
              private cookieService: AuthService,
              private windowService: WindowService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.courseId = params['courseId'];
      this.getCourse(this.courseId);
    })
  }

  getCourse(courseId?: any) {
    this.loading = true;
    this.courseService.getCourseById(courseId).subscribe(course => {
      this.selectedCourse = [course];
      this.loading = false;
    }, error => {
      this.alertService.errorMessage(error.message, 'Error');
      this.loading = false;
    })
  }

  findInstallment(module: any) {
    return {
      id: 0,
      name: 'Free',
      currency: '$',
      price: 0,
      paymentLink: 'https://google.com',
      paid: 'paid'
    };
  }

  openCourseDetails(course: any){
    this.currentModule = course?.module;
    this.currentInstallment = course?.installment;
    if (this.windowService.nativeDocument){
      const btn = document.getElementById('offcanvas-btn') as HTMLButtonElement;
      btn?.click();
    }
  }

  openBankCard(installment: any){
    this.alertService.warningMessage('Payment methods not allowed in Preview Mode', 'Warning');
  }
}
