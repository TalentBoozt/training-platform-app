import { Component } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgForOf, NgIf, NgStyle, NgSwitch, NgSwitchCase} from '@angular/common';
import {BasicDetailsComponent} from './basic-details/basic-details.component';
import {CourseDetailsComponent} from './course-details/course-details.component';
import {RelavantDetailsComponent} from './relavant-details/relavant-details.component';
import {PaymentDetailsComponent} from './payment-details/payment-details.component';
import {ModuleDetailsComponent} from './module-details/module-details.component';

@Component({
  selector: 'app-post-course',
  imports: [
    NgIf,
    NgSwitch,
    NgSwitchCase,
    BasicDetailsComponent,
    CourseDetailsComponent,
    RelavantDetailsComponent,
    PaymentDetailsComponent,
    ModuleDetailsComponent
  ],
  templateUrl: './post-course.component.html',
  styleUrl: './post-course.component.scss',
  standalone: true
})
export class PostCourseComponent {
  currentStep = 0;
  steps = [0, 1, 2, 3, 4];

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }
}
