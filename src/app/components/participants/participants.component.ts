import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CoursesService} from '../../services/courses.service';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../services/support/auth.service';
import {tap} from 'rxjs';

@Component({
  selector: 'app-participants',
  imports: [
    NgForOf,
    NgIf,
    FormsModule,
    NgStyle
  ],
  templateUrl: './participants.component.html',
  styleUrl: './participants.component.scss',
  standalone: true
})
export class ParticipantsComponent implements OnInit {
  courses: any[] = []; // Will contain all courses
  installments: any[] = []; // Will contain all installments
  participants: any[] = []; // All participants from the API
  paidStatus: any[] = [
    { name: 'Paid', value: 'paid' },
    { name: 'Unpaid', value: 'unpaid' },
    { name: 'Pending', value: 'pending' },
  ];
  accountStatus: any[] = [
    { name: 'Enrolled', value: 'Enrolled' },
    { name: 'Dropped', value: 'Dropped' },
    { name: 'Completed', value: 'Completed' },
  ];

  courseId: any;
  installmentId: any;
  searchTerm: string = '';

  organizationId: any;

  constructor(private courseService: CoursesService, private route: ActivatedRoute, private cookieService: AuthService) {}

  ngOnInit(): void {
    this.organizationId = this.cookieService.organization();
    this.courseId = this.getCourseId() || '';
    if (!this.courseId) this.getAllCourses().subscribe((courses)=> this.getParticipants(courses[0].id));
    this.getParticipants(this.courseId);
  }

  getAllCourses() {
    return this.courseService.getCoursesByOrganization(this.organizationId).pipe(
      tap((courses: any) => {
        this.courses = courses
        this.installments = this.courses.flatMap((course: any) => course.installment);
      })
    )
  }

  getCourseId(): string | null {
    return this.route.snapshot.queryParamMap.get('id');
  }

  getParticipants(courseId: any): void {
    if (!courseId) return;
    this.courseService.getFullParticipants(courseId).subscribe((response: any) => {
      let participants = response.enrolls.flatMap((enroll: any) => {
        const user = response.user[0]; // Assuming only one user per response

        return enroll.courses?.map((course: any) => {
          return course.installment?.map((installment: any) => {
            return {
              name: user.firstname + ' ' + user.lastname,
              email: user.email,
              pStatus: installment.paid === 'paid' ? 'paid' : installment.paid === null ? 'unpaid' : 'pending',
              aStatus: course.status === 'enrolled' ? 'Enrolled' : course.status === 'dropped' ? 'Dropped' : 'Pending',
              courseId: course.courseId,
              installmentId: installment.id,
            };
          });
        });
      });

      // Flatten the array and assign it to participants
      this.participants = participants.flat();

      // Populate courses and installments (you can use your own logic to populate these arrays)
      this.courses = response.enrolls.flatMap((enroll: any) =>
        enroll.courses?.map((course: any) => ({
          id: course?.courseId,
          name: course?.courseName,
        }))
      );

      this.installments = response.enrolls.flatMap((enroll: any) =>
        enroll.courses.flatMap((course: any) =>
          course.installment?.map((installment: any) => ({
            id: installment?.id,
            name: installment?.name,
          }))
        )
      );
    });
  }

  // Filter participants based on courseId, installmentId, and searchTerm
  get filteredParticipants() {
    if (!this.participants) return [];
    return this.participants.filter((p) => {
      return (
        (this.courseId ? p?.courseId === this.courseId : true) &&
        (this.installmentId ? p?.installmentId === this.installmentId : true) &&
        (this.searchTerm
          ? p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(this.searchTerm.toLowerCase())
          : true)
      );
    });
  }
}
