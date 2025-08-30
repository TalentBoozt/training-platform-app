import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CoursesService} from '../../services/courses.service';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../services/support/auth.service';
import {tap} from 'rxjs';
import {AlertsService} from '../../services/support/alerts.service';
import {WindowService} from '../../services/common/window.service';
import {NgxPaginationModule} from 'ngx-pagination';

@Component({
  selector: 'app-participants',
  imports: [
    NgForOf,
    NgIf,
    FormsModule,
    NgxPaginationModule,
    NgStyle
  ],
  templateUrl: './participants.component.html',
  styleUrl: './participants.component.scss',
  standalone: true
})
export class ParticipantsComponent implements OnInit {
  courses: any[] = []; // Will contain all courses
  installments: any[] = []; // Will contain all installments
  participants: any[] = [];
  filteredModalParticipants: any[] = [];

  selectedCourseName = '';
  selectedParticipant: any = null;
  modalCourseId: any;
  modalInstallments: any[] = [];
  modalInstallmentId: any = '';
  modalSearchTerm: string = '';
  paidStatus: any[] = [
    { name: 'Paid', value: 'paid' },
    { name: 'Unpaid', value: 'unpaid' },
    { name: 'Pending', value: 'pending' },
  ];
  accountStatus: any[] = [
    { name: 'Enrolled', value: 'enrolled' },
    { name: 'Dropped', value: 'dropped' },
    { name: 'Completed', value: 'completed' },
  ];

  courseId: any;
  installmentId: any;
  searchTerm: string = '';

  organizationId: any;

  currentParticipantsPage = 1;
  currentCoursesPage = 1;

  isUpdating: boolean = false;
  isOneTimePayment: boolean = false;

  constructor(private courseService: CoursesService,
              private route: ActivatedRoute,
              private windowService: WindowService,
              private alertService: AlertsService,
              private cookieService: AuthService) {}

  ngOnInit(): void {
    this.organizationId = this.cookieService.organization();
    // this.courseId = this.getCourseId() || '';
    this.route.queryParamMap.subscribe(params => {
      this.courseId = params.get('id');

      if (!this.courseId) this.getAllCourses().subscribe((courses)=> this.getParticipants(courses[0].id));
      else this.getParticipants(this.courseId);
    });
  }

  getAllCourses() {
    return this.courseService.getCoursesByOrganization(this.organizationId).pipe(
      tap((courses: any) => {
        this.courses = courses
        this.installments = this.courses.flatMap((course: any) => course.installment);
      })
    )
  }

  // if won't destroy the id with refresh of remove parameters
  // getCourseId(): string | null {
  //   return this.route.snapshot.queryParamMap.get('id');
  // }

  getParticipants(courseId: any): void {
    this.modalCourseId = courseId;

    this.courseService.getFullParticipants(courseId).subscribe((response: any) => {
      const getUser = (employeeId: string) => {
        const user = response.user?.find((u: any) => u.id === employeeId);
        return {
          id: user?.id,
          name: `${user?.firstname} ${user?.lastname}`,
          email: user?.email,
        };
      };

      this.participants = response.enrolls.flatMap((enroll: any) => {
        const user = getUser(enroll.employeeId);
        if (!user.id) return [];

        return enroll.courses
          ?.filter((course: any) => course.courseId === courseId)
          .flatMap((course: any) => {
            this.selectedCourseName = course?.courseName || 'Selected Course';
            this.isOneTimePayment = course?.modules[0]?.installmentId === 'onetime';
            if (!course.installment || course.installment.length === 0) {
              return [{
                ...user,
                pStatus: 'pending',
                aStatus: this.getEnrollmentStatus(course.status),
                courseId: course.courseId,
                installmentId: null,
              }];
            }

            return course.installment.map((installment: any) => ({
              ...user,
              pStatus: this.getPaymentStatus(installment.paid),
              aStatus: this.getEnrollmentStatus(course.status),
              courseId: course.courseId,
              installmentId: installment.id,
            }));
          }) || [];
      });

      // Setup installment dropdown
      this.modalInstallments = [];

      const selectedEnroll = response.enrolls.find((enroll: any) =>
        enroll.courses?.some((course: any) => course.courseId === courseId)
      );

      if (selectedEnroll) {
        const course = selectedEnroll.courses.find((c: any) => c.courseId === courseId);
        this.modalInstallments = course?.installment?.map((i: any) => ({
          id: i.id,
          name: i.name || `Installment ${i.id}`
        })) || [];
      }

      // Filter the table
      this.filterModalParticipants();

      // Show the modal
      if (this.windowService.nativeDocument) {
        this.currentParticipantsPage = 1;
        document.getElementById('enrollsBtn')?.click();
      }
    });
  }

  filterModalParticipants() {
    this.filteredModalParticipants = this.participants.filter(p =>
      (!this.modalInstallmentId || p.installmentId === this.modalInstallmentId) &&
      (!this.modalSearchTerm ||
        p.name.toLowerCase().includes(this.modalSearchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(this.modalSearchTerm.toLowerCase()))
    );
  }

  getPaymentStatus(paymentStatus: string | null): string {
    if (paymentStatus === 'paid') return 'paid';
    if (paymentStatus === null || paymentStatus === 'unpaid') return 'unpaid';
    return 'pending';
  }

  getEnrollmentStatus(status: string | null): string {
    if (status === 'enrolled') return 'enrolled';
    if (status === null || status === 'dropped') return 'dropped';
    return 'completed';
  }

  getCourses(enrolls: any[], courseId: string | null) {
    return enrolls.flatMap((enroll: any) =>
      enroll.courses?.filter((course: any) => !courseId || course.courseId === courseId).map((course: any) => ({
        id: course?.courseId,
        name: course?.courseName,
      })) || []
    );
  }

  getInstallments(enrolls: any[], courseId: string | null) {
    return enrolls.flatMap((enroll: any) =>
      enroll.courses?.filter((course: any) => !courseId || course.courseId === courseId)
        .flatMap((course: any) => course.installment?.map((installment: any) => ({
          id: installment?.id,
          name: installment?.name,
        })) || [])
    );
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

  updatePaymentStatus(eid: any, courseId: any, installmentId: any, pStatus: any) {
    if (!eid || !courseId || !installmentId || !pStatus) return;
    if (this.isOneTimePayment) {
      this.courseService.updateInstallmentPaymentStatusFullCourse(eid, courseId, installmentId, pStatus).subscribe(() => {
        this.alertService.successMessage('Payment status updated successfully', 'Success');
        this.getParticipants(this.courseId)
      }, () => {
        this.alertService.errorMessage('Failed to update payment status', 'Error');
      });
    } else {
      this.courseService.updateInstallmentPaymentStatus(eid, courseId, installmentId, pStatus).subscribe(() => {
        this.alertService.successMessage('Payment status updated successfully', 'Success');
        this.getParticipants(this.courseId)
      }, () => {
        this.alertService.errorMessage('Failed to update payment status', 'Error');
      });
    }
  }

  updateAccountStatus(eid: any, courseId: any, aStatus: any) {
    if (!eid || !courseId || !aStatus) return;
    this.courseService.updateEnrollmentStatus(eid, courseId, aStatus.toLowerCase()).subscribe((res) => {
      this.alertService.successMessage('Account status updated successfully', 'Success');
      this.getParticipants(this.courseId)
    }, (err) => {
      this.alertService.errorMessage('Failed to update account status', 'Error');
    });
  }

  viewParticipant(p: any) {
    this.selectedParticipant = p;
    if (this.windowService.nativeDocument) {
      document.getElementById('participantProfileBtn')?.click();
    }
  }
}
