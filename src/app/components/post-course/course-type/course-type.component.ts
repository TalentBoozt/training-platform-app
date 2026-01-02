import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-course-type',
  imports: [
    RouterLink
  ],
  templateUrl: './course-type.component.html',
  styleUrl: './course-type.component.scss',
  standalone: true
})
export class CourseTypeComponent {

  private router = inject(Router);

  goToRecorded() {
    this.router.navigate(['/post-rec'], { queryParams: { type: 'new' } });
  }
}
