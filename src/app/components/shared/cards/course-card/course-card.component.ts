import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();

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

  navigateToDetails(id: any) {
    this.router.navigate(['/course', id]);
  }

  navigateToParticipant(id:any) {
    this.router.navigate(['/participants'],{queryParams:{id}});
  }

  deleteCourse(id: any) {
    this.delete.emit(id);
  }

  editCourse(course: any) {
    this.edit.emit(course);
  }
}
