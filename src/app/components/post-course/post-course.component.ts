import { Component } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-post-course',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgClass,
    NgIf
  ],
  templateUrl: './post-course.component.html',
  styleUrl: './post-course.component.scss',
  standalone: true
})
export class PostCourseComponent {
  selectedCategory: any = 'Software Development and Engineering';
  selectedJobType: any = 'Backend Developer';
  isOtherCategorySelected: boolean = false;
  isOtherJobTypeSelected: boolean = false;

  companyLevel: any;
  jobId: any;
  formLocked: boolean = false;

  jobPostForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    category: new FormControl('IT', [Validators.required]),
    jobType: new FormControl('Web Developer', [Validators.required]),
    salary: new FormControl(''),
    minSalary: new FormControl(''),
    maxSalary: new FormControl(''),
    totalOpenings: new FormControl('', [Validators.required]),
    ageRange: new FormControl('18-30'),
    employeeType: new FormControl('', [Validators.required]),
    locationType: new FormControl('', [Validators.required]),
    skills: new FormControl(''),
    qualifications: new FormControl(''),
    experience: new FormControl(''),
    requirements: new FormControl(''),
    education: new FormControl(''),
    responsibilities: new FormControl(''),
    offer: new FormControl(''),
    es: new FormControl('BSc', [Validators.required]),
    exs: new FormControl('0-2 years', [Validators.required]),
    address: new FormControl(''),
    country: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    postdate: new FormControl('', [Validators.required]),
    expdate: new FormControl(''),
  })

  constructor() {}

  onCategoryChange(): void {}

  onJobTypeChange(): void {}

  filterCategories() {
    return [
      {name: 'Software Development and Engineering'},
      {name: 'Information Technology'},
      {name: 'Human Resources'},
      {name: 'Other'}
    ];
  }

  filterJobTypes(selectedCategory: any) {
    return [
      {name: 'Backend Developer'},
      {name: 'Frontend Developer'},
      {name: 'Full Stack Developer'},
      {name: 'Other'}
    ];
  }

  saveJobPost() {}

  updateJob(){}

  generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  uploadFile(event: any, filePath: string) {}

  preview(){
    setTimeout(() => {
      const model = document.getElementById('preview_model_open');
      model?.click();
    }, 100);
  }
}
