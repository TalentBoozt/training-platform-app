import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';

type QuestionForm = FormGroup<{
  id: FormControl<string>;
  questionText: FormControl<string>;
  questionType: FormControl<'multiple-choice' | 'multiple-select'>;
  required: FormControl<boolean>;
  options: FormArray<FormControl<string>>;
  correctAnswer: AbstractControl;
  explanation: FormControl<string>;
}>;

@Component({
  selector: 'app-question-builder',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    NgSwitchCase,
    NgSwitchDefault,
    NgSwitch
  ],
  templateUrl: './question-builder.component.html',
  styleUrl: './question-builder.component.scss',
  standalone: true
})
export class QuestionBuilderComponent implements AfterViewInit, OnChanges {

  @Output() questionsChange = new EventEmitter<any>();
  @Input() editQuestions: any

  questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice (Single)' },
    { value: 'multiple-select', label: 'Multiple Choice (Multiple)' },
    { value: 'true-false', label: 'True / False' },
    { value: 'text', label: 'Short Text' },
    { value: 'paragraph', label: 'Paragraph' },
    { value: 'likert', label: 'Likert Scale' },
    { value: 'fill-blank', label: 'Fill in the Blank' }
  ];

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      questions: this.fb.array([])
    });
  }

  ngAfterViewInit(): void {
    if (this.editQuestions) {
      this.editQuestions.forEach((question: any) => {
        this.addQuestion();
        this.questions.at(this.questions.length - 1).patchValue(question);

        const options = this.getOptions(this.questions.length - 1);
        question.options.forEach((option: any) => {
          options.push(this.fb.control(option));
        });
      });
    }
  }

  ngOnChanges(simpleChanges: SimpleChanges): void {
    if (simpleChanges['editQuestions'] && this.editQuestions) {
      this.editQuestions.forEach((question: any) => {
        this.addQuestion();
        this.questions.at(this.questions.length - 1).patchValue(question);

        const options = this.getOptions(this.questions.length - 1);
        question.options.forEach((option: any) => {
          options.push(this.fb.control(option));
        });
      });
    }
  }

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  addQuestion() {
    const questionTypeControl = this.fb.control<'multiple-choice' | 'multiple-select'>('multiple-choice', Validators.required);

    const question = this.fb.group({
      id: this.fb.control(Date.now().toString()),
      questionText: this.fb.control('', Validators.required),
      questionType: questionTypeControl,
      required: this.fb.control(true),
      options: this.fb.array<FormControl<string>>([]),
      correctAnswer: this.fb.control('', Validators.required),
      explanation: this.fb.control('')
    }) as QuestionForm | any;

    questionTypeControl.valueChanges.subscribe((type) => {
      if (type === 'multiple-select') {
        if (!(question.get('correctAnswer') instanceof FormArray)) {
          const array = this.fb.array<FormControl<string>>([]);
          question.setControl('correctAnswer', array);
        }
      } else {
        if (!(question.get('correctAnswer') instanceof FormControl)) {
          const control = this.fb.control('', Validators.required);
          question.setControl('correctAnswer', control);
        }
      }
    });

    this.questions.push(question);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  getOptions(qIndex: number): FormArray {
    return this.questions.at(qIndex).get('options') as FormArray;
  }

  getCorrectAnswerControl(qIndex: number): AbstractControl | null {
    return this.questions.at(qIndex).get('correctAnswer');
  }

  addOption(qIndex: number) {
    this.getOptions(qIndex).push(this.fb.control('', Validators.required));
  }

  removeOption(qIndex: number, optIndex: number) {
    const question = this.questions.at(qIndex);
    const options = this.getOptions(qIndex);
    const questionType = question.get('questionType')?.value;
    const correctAnswerControl = this.getCorrectAnswerControl(qIndex);

    // Remove option
    options.removeAt(optIndex);

    // Handle correctAnswer cleanup
    if (questionType === 'multiple-select' && correctAnswerControl instanceof FormArray) {
      const removedOptionValue = correctAnswerControl.at(optIndex)?.value;
      const indexInCorrect = correctAnswerControl.controls.findIndex(c => c.value === removedOptionValue);
      if (indexInCorrect !== -1) correctAnswerControl.removeAt(indexInCorrect);
    }

    if ((questionType === 'multiple-choice' || questionType === 'likert') && correctAnswerControl instanceof FormControl) {
      const removedOption = options.at(optIndex)?.value;
      if (correctAnswerControl.value === removedOption) {
        correctAnswerControl.setValue('');
      }
    }
  }

  isChecked(qIndex: number, value: string): boolean {
    const control = this.questions.at(qIndex).get('correctAnswer');
    return control instanceof FormArray && control.value.includes(value);
  }

  onCheckboxChange(qIndex: number, value: string, event: Event) {
    const control = this.questions.at(qIndex).get('correctAnswer');

    if (control instanceof FormArray) {
      const isChecked = (event.target as HTMLInputElement).checked;
      const index = control.controls.findIndex(c => c.value === value);

      if (isChecked && index === -1) {
        control.push(this.fb.control(value));
      } else if (!isChecked && index !== -1) {
        control.removeAt(index);
      }
    }
  }

  exportQuestions() {
    if (this.form.valid) {
      const rawQuestions = this.form.value.questions;

      const normalizedQuestions = rawQuestions.map((q: any) => ({
        ...q,
        correctAnswer: Array.isArray(q.correctAnswer)
          ? q.correctAnswer
          : [q.correctAnswer] // wrap single answer
      }));

      this.questionsChange.emit(normalizedQuestions);
    }
  }
}
