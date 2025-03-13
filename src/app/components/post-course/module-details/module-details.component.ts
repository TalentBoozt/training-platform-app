import {Component, OnInit} from '@angular/core';
import {ResumeStorageService} from '../../../services/support/resume-storage.service';
import {AlertsService} from '../../../services/support/alerts.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-module-details',
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './module-details.component.html',
  styleUrl: './module-details.component.scss',
  standalone: true
})
export class ModuleDetailsComponent implements OnInit{
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
    paid: false,
    status: 'upcoming'
  }

  installments: any[] = []

  constructor(private resumeStorage: ResumeStorageService, private alertService: AlertsService) {}

  ngOnInit(): void {
    const savedData = this.resumeStorage.getData();
    if (savedData.modules) {
      this.modules = savedData.modules;
    }
    if (savedData.installment && savedData.installment.length > 0){
      this.installments = savedData.installment;
    } else {
      this.alertService.errorMessage('You have not initialized any installment plan. You should initialize at least one installment plan in 4th step!', 'Error');
      return;
    }
  }

  addModule(): void {
    if (this.newModule.name &&
      this.newModule.description &&
      this.newModule.installmentId &&
      this.newModule.date &&
      this.newModule.start &&
      this.newModule.end){
      this.newModule.id = this.generateRandomId();
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
      installmentId: '',
      meetingLink: '',
      date: '',
      start: '',
      end: '',
      paid: false,
      status: 'upcoming'
    }
  }

  generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
