import {Component, Input} from '@angular/core';
import {NgForOf} from '@angular/common';
import {WindowService} from '../../../services/common/window.service';

@Component({
  selector: 'app-quiz-report',
  imports: [
    NgForOf
  ],
  templateUrl: './quiz-report.component.html',
  styleUrl: './quiz-report.component.scss',
  standalone: true
})
export class QuizReportComponent {
  @Input() quiz: any;
  @Input() userAnswers: any;
  @Input() submitted: any;

  constructor(private windowService: WindowService ) {}

  isCorrect(qId: string): boolean {
    const q = this.quiz.questions.find((q: any) => q.id === qId);
    const a = this.userAnswers[qId];
    return q.correctAnswer.includes(a);
  }

  get correctCount(): number {
    return this.quiz.questions.filter((q: any) => this.isCorrect(q.id)).length;
  }

  marks(correctCount: number, length: number): string {
    const percentage = (correctCount / length) * 100;
    return `${percentage.toFixed(2)}%`;
  }

  tryAgain() {
    if (this.windowService.nativeWindow) {
      window.location.reload();
    }
  }
}
