import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-question-display',
  imports: [
    NgSwitch,
    NgClass,
    NgForOf,
    NgSwitchCase,
    FormsModule,
    NgIf
  ],
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.scss',
  standalone: true
})
export class QuestionDisplayComponent {
  @Input() question: any;
  @Input() answer: any;
  @Input() submitted: any = false;
  @Input() showExplanation = false;

  @Output() answerChange = new EventEmitter<any>();
  @Output() submit = new EventEmitter<void>();

  onSelectOption(option: any) {
    this.answerChange.emit(option);
  }

  onSelectMulti(option: string, event: any) {
    const checked = (event.target as HTMLInputElement).checked;
    let newVal = this.answer || [];
    newVal = checked
      ? [...newVal, option]
      : newVal?.filter((o: string) => o !== option);
    this.answerChange.emit(newVal);
  }

  submitAnswer() {
    this.submit.emit();
  }

  getAnswerClass(option: string): string {
    if (!this.submitted || !this.question) return '';

    // const qId = this.question.id;
    // if (!this.submitted[qId]) return '';

    const isCorrect = this.question.correctAnswer.includes(option);
    const isSelected = Array.isArray(this.answer)
      ? this.answer.includes(option)
      : this.answer === option;

    if (isSelected && isCorrect) return 'correct';
    if (isSelected && !isCorrect) return 'wrong';

    return '';
  }
}
