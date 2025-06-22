import {Component, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CoursesService} from '../../../services/courses.service';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {QuestionDisplayComponent} from '../question-display/question-display.component';
import {QuizReportComponent} from '../quiz-report/quiz-report.component';

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

  get currentQuestion() {
    return this.quiz?.questions[this.currentIndex];
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const quizId = params.get('quizId');
      const courseId = params.get('courseId');

      if (quizId && courseId) {
        this.quizService.getQuizById(courseId, quizId).subscribe((res) => {
          this.quiz = res;
        });
      }
    })
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
    const isFinalAttempt = this.isFinalAttempt();
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
    this.showReport = true;
  }
}
