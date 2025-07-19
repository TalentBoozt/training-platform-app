import { Component } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CoursesService} from '../../services/courses.service';
import {AlertsService} from '../../services/support/alerts.service';
import {QuizDTO} from '../../shared/data-models/QuizDTO';
import {NgForOf, NgIf} from '@angular/common';
import {QuizzesComponent} from '../quizzes/quizzes.component';
import {tap} from 'rxjs';

@Component({
  selector: 'app-quiz-manager',
  imports: [
    NgIf,
    NgForOf,
    QuizzesComponent
  ],
  templateUrl: './quiz-manager.component.html',
  styleUrl: './quiz-manager.component.scss',
  standalone: true
})
export class QuizManagerComponent {
  courseId: any;
  moduleId: any;
  quizzId: any;
  isEdit: boolean = false;
  course: any;
  modules: any[] = [];
  selectedCourse: any;
  loading: boolean = false;

  editQuizzesMap: { [moduleId: string]: any } = {};
  clearQuestions: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private courseService: CoursesService,
    private alertService: AlertsService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('courseId');
      this.moduleId = params.get('moduleId');
    })

    this.route.queryParamMap.subscribe(params => {
      this.quizzId = params.get('materialId');
      this.isEdit = params.get('edit') === 'true';
    })

    this.getCourse(this.courseId).subscribe((res) => {
      this.course = res;
      this.modules = this.selectedCourse.modules.filter((module: any) => module.id === this.moduleId);

      if (this.quizzId && this.isEdit) {
        this.getQuizz(this.quizzId);
      }
    });
  }

  getCourse(courseId?: any) {
    this.loading = true;
    return this.courseService.getCourseById(courseId).pipe(
      tap((course: any) => {
        this.selectedCourse = course;
        this.loading = false;
      }, error => {
        this.alertService.errorMessage(error.message, 'Error');
        this.loading = false;
      })
    )
  }

  getQuizz(quizzId: any) {
    if (this.course) {
      const quizz = this.course?.quizzes.find((quizz: any) => quizz.id === quizzId);
      if (quizz) {
        this.onEdit(quizz)
      }
    }
  }

  onEdit(quizz: any): void {
    this.editQuizzesMap[quizz.moduleId] = quizz;
  }

  onQuizSubmit(quiz: QuizDTO) {
    if (quiz) {
      this.courseService.createQuiz(quiz).subscribe({
        next: () => {
          this.clearQuestions = true;
          this.alertService.successMessage('Quiz created successfully', 'Success')
        },
        error: err => this.alertService.errorMessage(err.message, 'Failed to create quiz')
      });
    } else {
      this.alertService.errorMessage('Failed to create quiz', 'Error');
    }
  }

  onQuizUpdate(quiz: QuizDTO) {
    if (quiz) {
      this.courseService.updateQuiz(quiz).subscribe({
        next: () => {
          this.clearQuestions = true;
          this.alertService.successMessage('Quiz updated successfully', 'Success')
        },
        error: err => this.alertService.errorMessage(err.message, 'Failed to update quiz')
      });
    } else {
      this.alertService.errorMessage('Failed to update quiz', 'Error');
    }
  }
}
