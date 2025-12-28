import { Component } from '@angular/core';
import { ResumeStorageService } from '../../services/support/resume-storage.service';
import { AlertsService } from '../../services/support/alerts.service';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { zonedTimeToUtc } from 'date-fns-tz';
import * as moment from 'moment-timezone';
import { TimezoneService } from '../../services/support/timezone.service';

@Component({
  selector: 'app-update-modules',
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './update-modules.component.html',
  styleUrl: './update-modules.component.scss',
  standalone: true
})
export class UpdateModulesComponent {
  modules: any[] = [];
  editMode = false;
  newModule = {
    id: '',
    name: '',
    description: '',
    installmentId: '',
    meetingLink: '',
    date: '',
    start: '',
    end: '',
    utcStart: '',
    utcEnd: '',
    trainerTimezone: '',
    paid: false,
    status: 'upcoming'
  }

  status: any[] = [
    { name: "Upcoming", value: "upcoming" },
    { name: "In Progress", value: "inprogress" },
    { name: "Concluded", value: "concluded" }
  ]

  isFreeCheck = false

  courseId: any;

  timezones: string[] = moment.tz.names();

  constructor(private resumeStorage: ResumeStorageService,
    private courseService: CoursesService,
    private route: ActivatedRoute,
    private timezoneService: TimezoneService,
    private alertService: AlertsService) { }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId')
    this.getCourse(this.courseId);
  }

  getCourse(courseId: any) {
    if (courseId) {
      this.courseService.getCourseById(courseId).subscribe(response => {
        this.modules = response.modules
      })
    }
  }

  addModule(): void {
    if (!this.newModule.id) {
      this.alertService.errorMessage('Please choose a module first to update!', 'Error');
      return;
    }
    if (this.newModule.name &&
      this.newModule.description &&
      this.newModule.installmentId &&
      this.newModule.date &&
      this.newModule.start &&
      this.newModule.end) {
      if (this.newModule.meetingLink && !this.isValidUrl(this.newModule.meetingLink)) {
        this.alertService.errorMessage('Please enter a valid url', 'Error');
        return;
      }
      this.updateData();
    } else {
      this.alertService.errorMessage('Fill all required fields!', 'Error')
    }
  }

  removeModule(index: number, module: any): void {
    if (index && module) {
      if (confirm('Delete module permanently?')) {
        this.courseService.deleteModule(this.courseId, module.id).subscribe(response => {
          this.modules.splice(index, 1);
          this.alertService.successMessage('Module deleted successfully!', 'Success')
        }, error => this.alertService.errorMessage('Failed to delete Module', 'Error'))
      }
    }
  }

  updateData(): void {
    const { date, start, end } = this.newModule;
    const timezone = this.newModule.trainerTimezone || this.timezoneService.getTimezone();

    const startDateTimeStr = `${date}T${start}`;
    const endDateTimeStr = `${date}T${end}`;

    const utcStart = zonedTimeToUtc(startDateTimeStr, timezone);
    const utcEnd = zonedTimeToUtc(endDateTimeStr, timezone);

    this.newModule.utcStart = utcStart.toISOString();
    this.newModule.utcEnd = utcEnd.toISOString();
    this.newModule.trainerTimezone = timezone;

    this.courseService.updateModule(this.courseId, this.newModule).subscribe(response => {
      this.resetForm();
      this.getCourse(this.courseId);
      this.alertService.successMessage('Module Updated', 'Success');
    }, error => this.alertService.errorMessage('Failed to Update Module', 'Error'));
  }

  resetForm(): void {
    this.editMode = false;
    this.newModule = {
      id: '',
      name: '',
      description: '',
      installmentId: this.isFreeCheck ? 'free' : '',
      meetingLink: '',
      date: '',
      start: '',
      end: '',
      utcStart: '',
      utcEnd: '',
      trainerTimezone: '',
      paid: false,
      status: 'upcoming'
    }
  }

  isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }

  editModule(module: any) {
    this.editMode = true;
    if (module) {
      this.newModule = {
        id: module.id,
        name: module.name,
        description: module.description,
        installmentId: module.installmentId,
        meetingLink: module.meetingLink,
        date: module.date,
        start: module.start,
        end: module.end,
        utcStart: module.utcStart,
        utcEnd: module.utcEnd,
        trainerTimezone: module.trainerTimezone,
        paid: module.paid,
        status: module.status
      }
    }
  }
}
