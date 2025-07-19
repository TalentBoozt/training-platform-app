import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {QuestionBuilderComponent} from './question-builder/question-builder.component';
import {QuestionDTO} from '../../shared/data-models/QuestionDTO';
import {QuizDTO} from '../../shared/data-models/QuizDTO';
import {NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-quizzes',
  imports: [
    QuestionBuilderComponent,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './quizzes.component.html',
  styleUrl: './quizzes.component.scss',
  standalone: true
})
export class QuizzesComponent implements AfterViewInit, OnChanges {
  @Input() courseId!: string;
  @Input() moduleId!: string;
  @Input() editMaterial: any;
  @Input() clearQuestions: boolean = false;
  @Output() quizCreated = new EventEmitter<QuizDTO>();
  @Output() quizUpdated = new EventEmitter<QuizDTO>();

  quizForm: FormGroup;

  questions: QuestionDTO[] = [];
  isAnimated = false;

  constructor(private fb: FormBuilder) {
    this.quizForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      visibility: ['participant', Validators.required],
      attemptLimit: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngAfterViewInit(): void {
    if (this.editMaterial) {
      this.quizForm.patchValue(this.editMaterial);
      this.questions = this.editMaterial.questions;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clearQuestions'] && this.clearQuestions) this.questions = [];
  }

  onQuestionsChange(qs: any) {
    this.questions = qs;
    if (qs) this.isAnimated = true;
  }

  submit() {
    if (this.quizForm.invalid || this.questions.length === 0) return;

    const quiz: QuizDTO | any = {
      ...this.quizForm.value,
      id: this.generateId(),
      courseId: this.courseId,
      moduleId: this.moduleId,
      creationDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
      questions: this.questions,
    };

    this.quizCreated.emit(quiz);
  }

  update() {
    if (this.quizForm.invalid || this.questions.length === 0) return;
    if (!this.editMaterial || !this.editMaterial.id) return;

    const quiz: QuizDTO | any = {
      ...this.quizForm.value,
      id: this.editMaterial.id,
      courseId: this.editMaterial.courseId,
      moduleId: this.editMaterial.moduleId,
      creationDate: this.editMaterial.creationDate,
      updateDate: new Date().toISOString(),
      questions: this.questions,
    };

    this.quizUpdated.emit(quiz);
  }

  generateId() {
    return Math.random().toString(36).substring(2, 9);
  }
}
