import {AfterViewInit, Component} from '@angular/core';
import {AlertsService} from '../../../services/alerts.service';
import {ResumeStorageService} from '../../../services/resume-storage.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-basic-details',
  imports: [
    FormsModule
  ],
  templateUrl: './basic-details.component.html',
  styleUrl: './basic-details.component.scss',
  standalone: true
})
export class BasicDetailsComponent implements AfterViewInit {
  basicDetails = {
    name: '',
    overview: '',
    lecturer: '',
    language: '',
    level: '',
    duration: '',
    email: ''
  };

  constructor(private resumeStorage: ResumeStorageService, private alertService: AlertsService) {}

  ngAfterViewInit(): void {
    const savedData = this.resumeStorage.getData();
    if (savedData?.basicDetails) {
      this.basicDetails = savedData.basicDetails;
    }
  }

  saveData(): void {
    if (this.basicDetails.email &&
      this.basicDetails.name &&
      this.basicDetails.overview &&
      this.basicDetails.lecturer &&
      this.basicDetails.language &&
      this.basicDetails.level) {
      if (!this.isValidEmail(this.basicDetails.email)){
        this.alertService.errorMessage('Please enter a valid email address', 'Error');
        return;
      }
      this.resumeStorage.saveData('basicDetails', this.basicDetails);
      this.alertService.successMessage('Basic details saved! Go to the next step', 'Success');
    } else {
      this.alertService.errorMessage('Please fill in all the required fields', 'Error');
    }
  }

  isValidEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }
}
