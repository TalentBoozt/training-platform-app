import { Component, OnInit } from '@angular/core';
import { ResumeStorageService } from '../../../services/support/resume-storage.service';
import { AlertsService } from '../../../services/support/alerts.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { TimezoneService } from '../../../services/support/timezone.service';

import * as moment from 'moment-timezone';
import { zonedTimeToUtc } from 'date-fns-tz';

@Component({
  selector: 'app-module-details',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './module-details.component.html',
  styleUrl: './module-details.component.scss',
  standalone: true
})
export class ModuleDetailsComponent implements OnInit {
  modules: any[] = [];
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
    status: 'upcoming',
    onetimePayment: false
  }

  installments: any[] = []

  isFreeCheck = false
  isOnetimePayment = false

  timezones: string[] = moment.tz.names();
  trainerTimezone: string = '';

  constructor(private resumeStorage: ResumeStorageService,
    private timezoneService: TimezoneService,
    private alertService: AlertsService) { }

  ngOnInit(): void {
    this.trainerTimezone = this.timezoneService.getTimezone();
    const savedData = this.resumeStorage.getData();
    if (savedData.modules) {
      this.modules = savedData.modules;
      this.trainerTimezone = savedData.relevantDetails.trainerTimezone
    }
    if (savedData?.basicDetails?.paymentType == 'onetime') {
      this.isOnetimePayment = true;
      this.newModule.installmentId = 'onetime';
    } else {
      if (!savedData?.basicDetails?.paymentType) {
        this.alertService.errorMessage('Payment type not found! Add it first in step 1', 'Error');
        return;
      }
    }
    if (savedData?.relevantDetails?.freeCheck) {
      this.isFreeCheck = true;
      this.newModule.installmentId = 'free';
    } else {
      if (savedData.installment && savedData.installment.length > 0) {
        if (!this.isOnetimePayment) this.installments = savedData.installment;
      } else {
        this.alertService.errorMessage('You have not initialized any installment plan. You should initialize at least one installment plan in 4th step!', 'Error');
        return;
      }
    }
  }

  addModule(): void {
    const { name, description, installmentId, date, start, end } = this.newModule;
    if (name && description && installmentId && date && start && end) {
      if (this.newModule.meetingLink && !this.isValidUrl(this.newModule.meetingLink)) {
        this.alertService.errorMessage('Please enter a valid url', 'Error');
        return;
      }

      const { date, start, end } = this.newModule;
      const timezone = this.trainerTimezone;

      const startDateTimeStr = `${date}T${start}`;
      const endDateTimeStr = `${date}T${end}`;

      const utcStart = zonedTimeToUtc(startDateTimeStr, timezone);
      const utcEnd = zonedTimeToUtc(endDateTimeStr, timezone);

      this.newModule.utcStart = utcStart.toISOString();
      this.newModule.utcEnd = utcEnd.toISOString();
      this.newModule.trainerTimezone = timezone;

      this.newModule.id = this.generateRandomId();
      this.newModule.onetimePayment = this.isOnetimePayment;
      this.modules.push({ ...this.newModule });
      this.saveData();
      this.resetForm();
    } else {
      this.alertService.errorMessage('Fill all required fields!', 'Error')
    }
  }

  removeModule(index: number): void {
    this.modules.splice(index, 1);
    this.saveData();
  }

  saveData(): void {
    this.resumeStorage.saveData('modules', this.modules);
  }

  resetForm(): void {
    this.newModule = {
      id: '',
      name: '',
      description: '',
      installmentId: this.isFreeCheck ? 'free' : this.isOnetimePayment ? 'onetime' : '',
      meetingLink: '',
      date: '',
      start: '',
      end: '',
      utcStart: '',
      utcEnd: '',
      trainerTimezone: this.timezoneService.getTimezone(),
      paid: false,
      status: 'upcoming',
      onetimePayment: false
    }
  }

  generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }
}
