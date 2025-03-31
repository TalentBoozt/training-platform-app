import {Component, Input, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {CoursesService} from '../../../../services/courses.service';

@Component({
  selector: 'app-course-card',
  imports: [
    NgIf,
    RouterLink
  ],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
  standalone: true
})
export class CourseCardComponent implements OnInit {

  @Input('course') course: any;

  participants: any[] = [];

  constructor(private router: Router, private courseService: CoursesService) {
  }

  ngOnInit() {
    this.getAllParticipants();
  }

  getAllParticipants() {
    return this.courseService.getParticipants(this.course.id).subscribe(response => {
      this.participants = response;
    });
  }

  navigateToDetails() {
    this.router.navigate(['/course', this.course.id]);
  }

  navigateToParticipant(id:any) {
    this.router.navigate(['/participants'],{queryParams:{id}});
  }
}
