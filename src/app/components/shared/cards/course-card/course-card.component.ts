import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {CoursesService} from '../../../../services/courses.service';
import {finalize} from 'rxjs';
import {AlertsService} from '../../../../services/support/alerts.service';

@Component({
  selector: 'app-course-card',
  imports: [
    NgIf,
    RouterLink,
    NgClass
  ],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss',
  standalone: true
})
export class CourseCardComponent implements OnInit {

  @Input('course') course: any;
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Output() openMaterials: EventEmitter<any> = new EventEmitter<any>();
  @Output() audience: EventEmitter<any> = new EventEmitter<any>();

  participants: any[] = [];
  isUpdating: boolean = false;

  constructor(private router: Router, private courseService: CoursesService, private alertService: AlertsService) {
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

  toggleAudience(courseId: any) {
    this.audience.emit(courseId);
  }

  navigateToMaterials(id: any) {
    this.openMaterials.emit(id);
  }

  getClassForStatus(status: string): string {
    switch (status) {
      case 'upcoming': return 'upcoming';
      case 'ongoing': return 'ongoing';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return '--';
    }
  }

  changeStatus(status: string, course: any) {
    if (course.courseStatus === status || this.isUpdating) return;

    this.isUpdating = true;

    this.courseService.updateCourseStatus(course.id, status)
      .pipe(finalize(() => this.isUpdating = false))
      .subscribe({
        next: () => {
          course.courseStatus = status;
          this.alertService.successMessage('Status changed successfully.', 'Success');
        },
        error: (err) => {
          this.alertService.errorMessage(err.message, 'Error');
        }
      });
  }
}
