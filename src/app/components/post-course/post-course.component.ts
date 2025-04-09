import {Component, OnInit} from '@angular/core';
import {NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import {BasicDetailsComponent} from './basic-details/basic-details.component';
import {CourseDetailsComponent} from './course-details/course-details.component';
import {RelavantDetailsComponent} from './relavant-details/relavant-details.component';
import {PaymentDetailsComponent} from './payment-details/payment-details.component';
import {ModuleDetailsComponent} from './module-details/module-details.component';
import {PreviewPostComponent} from './preview-post/preview-post.component';
import {ResumeStorageService} from '../../services/support/resume-storage.service';
import {RouterLink} from '@angular/router';

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
    ModuleDetailsComponent,
    PreviewPostComponent,
    RouterLink
  ],
  templateUrl: './post-course.component.html',
  styleUrl: './post-course.component.scss',
  standalone: true
})
export class PostCourseComponent implements OnInit{
  currentStep = 0;
  steps = [0, 1, 2, 3, 4, 5];
  draft: boolean = false;

  constructor(private resumeStorage: ResumeStorageService) {
  }
  ngOnInit() {
    this.loadDraft();
  }

  loadDraft(){
    const savedData = this.resumeStorage.getData();
    this.draft = savedData && Object.keys(savedData).length > 0;
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      if (!this.draft)
        this.loadDraft()
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      if (!this.draft)
        this.loadDraft()
    }
  }

  clearDraft(): void {
    if (confirm('This will remove all your savings!')){
      this.resumeStorage.clearData();
      this.loadDraft();
    }
  }
}
