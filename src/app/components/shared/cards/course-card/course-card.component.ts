import {Component, Input} from '@angular/core';
import {NgIf} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-course-card',
  imports: [
    NgIf
  ],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
  standalone: true
})
export class CourseCardComponent {

  @Input('course') course: any;

  constructor(private router: Router) {
  }

  navigateToDetails() {
    this.router.navigate(['course', this.course.id]);
  }
}
