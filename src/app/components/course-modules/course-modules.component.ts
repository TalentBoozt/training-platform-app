import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {ModuleCardComponent} from "../shared/cards/module-card/module-card.component";
import {WindowService} from '../../services/common/window.service';
import {CoursesService} from '../../services/courses.service';
import {AlertsService} from '../../services/support/alerts.service';
import {AuthService} from '../../services/support/auth.service';
import {EmployeeService} from '../../services/employee.service';

@Component({
  selector: 'app-course-modules',
  imports: [
    NgForOf,
    NgIf,
    ModuleCardComponent
  ],
  templateUrl: './course-modules.component.html',
  styleUrl: './course-modules.component.scss',
  standalone: true
})
export class CourseModulesComponent implements OnInit{
  courseId: any;
  employeeId: any;
  employee: any;
  selectedCourse: any[] = [];

  bankInstallment: any;

  public activeTab: { [courseId: string]: 'content' | 'leaderboard' } = {};

  constructor(private router: Router,
              private route: ActivatedRoute,
              private courseService: CoursesService,
              private employeeService: EmployeeService,
              private alertService: AlertsService,
              private cookieService: AuthService,
              private windowService: WindowService) {
  }

  ngOnInit(): void {
    this.employeeId = this.cookieService.userID();
    this.route.params.subscribe(params => {
      this.courseId = params['courseId'];
      this.getCourse(this.courseId);
    })
  }

  setActiveTab(courseId: string, tab: 'content' | 'leaderboard') {
    this.activeTab[courseId] = tab;
  }

  getActiveTab(courseId: string): 'content' | 'leaderboard' {
    return this.activeTab[courseId] || 'content';
  }

  getCourse(courseId?: any) {
    this.courseService.getCourseById(courseId).subscribe(course => {
      this.selectedCourse = [course];
      if (this.selectedCourse.length == 0){
        this.router.navigate(['/enroll', this.courseId]);
      }
    }, error => this.alertService.errorMessage(error.message, 'Error'))
  }

  findInstallment(module: any) {
    let installmentVal = {};
    let course: any[] = [];
    const emp = this.employee?.find((emp: any) => emp.employeeId === this.employeeId);
    if (emp && emp.courses){
      course = emp.courses?.filter((course:any) => course.courseId === this.courseId);
      course[0]?.installment?.forEach((installment: any) => {
        if (installment.id == module.installmentId) {
          installmentVal = installment;
        } else if (module.installmentId == 'free') {
          installmentVal = {paid: 'free'}
        }
      })
    }
    if (!course[0]?.installment || course[0]?.installment?.length == 0){
      installmentVal = {paid: 'free'}
    }
    return installmentVal;
  }

  findMaterials(m: any, c: any) {
    let materials: any[] = [];
    c.materials?.forEach((material: any) => {
      if (material.moduleId == m.id){
        materials.push(material);
      }
    })
    return materials.filter(m => m.visibility != 'only-me');
  }

  findRecordings(m: any, c: any) {
    let recordings: any[] = [];
    c.recordings?.forEach((recording: any) => {
      if (recording.moduleId == m.id){
        recordings.push(recording);
      }
    })
    return recordings.filter(r => r.visibility != 'only-me');
  }

  findQuizzes(m: any, c: any) {
    let quizzes: any[] = [];
    c.quizzes?.forEach((quiz: any) => {
      if (quiz.moduleId == m.id){
        quizzes.push(quiz);
      }
    })
    return quizzes.filter(q => q.visibility != 'only-me');
  }

  openBankCard(installment: any){
    this.bankInstallment = installment;
    if (this.windowService.nativeDocument){
      const btn = document.getElementById('bankCardBtn') as HTMLButtonElement;
      btn?.click();
    }
  }
}
