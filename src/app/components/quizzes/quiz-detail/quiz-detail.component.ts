import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CoursesService} from '../../../services/courses.service';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {QuestionDisplayComponent} from '../question-display/question-display.component';
import {QuizReportComponent} from '../quiz-report/quiz-report.component';
import {AuthService} from '../../../services/support/auth.service';
import {AlertsService} from '../../../services/support/alerts.service';

@Component({
  selector: 'app-quiz-detail',
  imports: [
    NgIf,
    FormsModule,
    QuestionDisplayComponent,
    QuizReportComponent
  ],
  templateUrl: './quiz-detail.component.html',
  styleUrl: './quiz-detail.component.scss',
  standalone: true
})
export class QuizDetailComponent {
  route = inject(ActivatedRoute);
  quizService = inject(CoursesService);

  quiz: any;
  currentIndex = 0;
  userAnswers: { [id: string]: any } = {};
  submitted: { [id: string]: boolean } = {};
  showReport = false;

  userId: any;

  hasReachedLimit = false;
  attempts: any[] = [];

  get currentQuestion() {
    return this.quiz?.questions[this.currentIndex];
  }

  constructor(private authService: AuthService, private alertService: AlertsService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const quizId = params.get('quizId');
      const courseId = params.get('courseId');

      if (quizId && courseId) {
        this.quizService.getQuizById(courseId, quizId).subscribe((res) => {
          this.quiz = res;

          // After loading quiz, check previous attempts
          this.userId = this.authService.userID();
          this.getAllAttempts(this.userId, quizId, res.attemptLimit);
        });
      }
    });
  }

  getAllAttempts(userId: any, quizId: any, attemptLimit: any) {
    this.quizService.getAttempts(this.userId, quizId).subscribe((attempts) => {
      this.attempts = attempts;
      if (attempts.length >= attemptLimit) {
        this.hasReachedLimit = true;
        alert('You have reached the maximum number of attempts for this quiz.');
      }
    });
  }

  onAnswerChange(value: any) {
    const qId = this.currentQuestion.id;
    this.userAnswers[qId] = value;
  }

  onQuestionSubmit() {
    const qId = this.currentQuestion.id;
    this.submitted[qId] = true;
  }

  shouldShowExplanation(qId: string) {
    const question = this.quiz.questions.find((q: any) => q.id === qId);
    const isCorrect = this.isAnswerCorrect(qId);
    const isFinalAttempt = this.hasReachedLimit;
    return this.submitted[qId] && (isCorrect || isFinalAttempt);
  }

  isAnswerCorrect(qId: string): boolean {
    const question = this.quiz.questions.find((q: any) => q.id === qId);
    const userAns = this.userAnswers[qId];
    const correctAns = question.correctAnswer;

    if (question.questionType === 'multiple-select') {
      return Array.isArray(userAns) &&
        correctAns.every((v: string) => userAns.includes(v)) &&
        userAns.length === correctAns.length;
    }
    return correctAns.includes(userAns);
  }

  nextQuestion() {
    if (this.currentIndex < this.quiz.questions.length - 1) {
      this.currentIndex++;
    }
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  isLastQuestion(): boolean {
    return this.currentIndex === this.quiz.questions.length - 1;
  }

  isFinalAttempt(): boolean {
    // For now, hardcoded. Later, implement actual attempt tracking
    return true;
  }

  submitQuiz() {
    if (!this.allRequiredAnswered()) {
      this.alertService.errorMessage('Please answer all required questions', 'Error');
      return;
    }

    const answers = Object.keys(this.userAnswers).map(qId => ({
      questionId: qId,
      selectedAnswers: Array.isArray(this.userAnswers[qId])
        ? this.userAnswers[qId]
        : [this.userAnswers[qId]]
    }));

    const submissionPayload = {
      employeeId: this.userId,
      courseId: this.quiz.courseId,
      moduleId: this.quiz.moduleId,
      quizId: this.quiz.id,
      answers
    };

    this.quizService.submitQuiz(submissionPayload).subscribe({
      next: (res) => {
        this.showReport = true;
        this.alertService.successMessage('Quiz submitted successfully', 'Success');
      },
      error: (err) => {
        this.alertService.errorMessage(err.message, 'Error');
      }
    });
  }

  allRequiredAnswered(): boolean {
    return this.quiz.questions.every((q: any) => {
      if (!q.required) return true;
      const a = this.userAnswers[q.id];
      return a && (Array.isArray(a) ? a.length > 0 : a !== '');
    });
  }
}
