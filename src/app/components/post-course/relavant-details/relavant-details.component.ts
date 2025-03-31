import {ChangeDetectionStrategy, Component, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ResumeStorageService} from '../../../services/support/resume-storage.service';
import {AlertsService} from '../../../services/support/alerts.service';
import {FileUploadService} from '../../../services/support/file-upload.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {CoursesService} from '../../../services/courses.service';
import {tap} from 'rxjs';

@Component({
  selector: 'app-relavant-details',
    imports: [
        FormsModule,
        NgForOf,
        NgClass,
        NgIf,
        ReactiveFormsModule
    ],
  templateUrl: './relavant-details.component.html',
  styleUrl: './relavant-details.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RelavantDetailsComponent implements OnInit, OnChanges, OnDestroy {
  relevantDetails = {
    skills: [] as string[],
    startDate: '',
    startTime: '',
    endTime: '',
    coverImage: '',
    freeCheck: false,
    currency: '$',
    price: '',
    mediaType: 'zoom',
    location: '',
    category: '',
    courseStatus: 'upcoming'
  };

  availableCategories: string[] = ['Technology', 'Marketing', 'Design', 'Health', 'Business'];
  filteredCategories: string[] = [];

  loading = false;
  inputValue: string = ''; // for skills

  constructor(private resumeStorage: ResumeStorageService,
              private alertService: AlertsService,
              private courseService: CoursesService,
              private fileUploadService: FileUploadService) {}

  ngOnInit(): void {
    const savedData = this.resumeStorage.getData();
    if (savedData?.relevantDetails) {
      this.relevantDetails = savedData.relevantDetails;
      this.selectedPrice = this.relevantDetails.price;
      this.selectedCurrency = this.relevantDetails.currency;
    }

    this.loadCategories().subscribe();
  }

  ngOnChanges() {
    if (this.relevantDetails.freeCheck) {
      this.selectedCurrency = '$';
      this.selectedPrice = '0';
    } else {
      this.selectedCurrency = this.relevantDetails.currency;
      this.selectedPrice = this.relevantDetails.price;
    }
  }

  ngOnDestroy() {
    if (this.relevantDetails.freeCheck){
      const savedData = this.resumeStorage.getData();
      if (savedData?.basicDetails) {
        savedData.basicDetails.paymentMethod = 'free';
      }
    }
  }

  loadCategories() {
    return this.courseService.getAllCategories().pipe(
      tap(categories => {
        if (categories && categories.length > 0) {
          this.availableCategories = categories
        }
      })
    )
  }

  filterCategories() {
    if (this.relevantDetails.category) {
      this.filteredCategories = this.availableCategories.filter(category =>
        category.toLowerCase().includes(this.relevantDetails.category.toLowerCase())
      );
    } else {
      this.filteredCategories = [];
    }
  }

  selectCategory(category: string) {
    this.relevantDetails.category = category;
    this.filteredCategories = [];
  }

  addCategory() {
    if (this.relevantDetails.category && !this.availableCategories.includes(this.relevantDetails.category)) {
      this.availableCategories.push(this.relevantDetails.category);
      this.filteredCategories = [];
    }
  }

  // Add skill on Enter or Comma
  addSkill(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const value: any = input.value.trim();

    if ((event.key === 'Enter' || event.key === ',') && value) {
      event.preventDefault(); // Prevent form submission
      if (!this.relevantDetails.skills.includes(value)) {
        this.relevantDetails.skills.push(value); // Add unique skills
      }
      this.inputValue = ''; // Clear input field
    }
  }

  // Remove skill
  removeSkill(skill: string): void {
    this.relevantDetails.skills = this.relevantDetails.skills.filter(s => s !== skill);
  }

  saveData(): void {
    if (this.relevantDetails.startDate &&
      this.relevantDetails.startTime &&
      this.relevantDetails.endTime &&
      this.relevantDetails.currency &&
      this.relevantDetails.skills &&
      this.relevantDetails.mediaType) {
      this.resumeStorage.saveData('relevantDetails', this.relevantDetails);
      this.alertService.successMessage('Relevant details saved! Go to the next step', 'Success');
    } else {
      this.alertService.errorMessage('Please fill in all the required fields', 'Error');
    }
  }

  generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  uploadFile(event: any, filePath: string) {
    const file = event.target.files[0];
    const maxFileSize = 1.5 * 1024 * 1024;
    const allowedFileTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (file) {
      if (file.size > maxFileSize) {
        this.alertService.warningMessage('File size exceeds the maximum limit of 1.5MB.', 'Warning');
        return;
      }
      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.warningMessage('Only PNG and JPEG files are allowed.', 'Warning');
        return;
      }
      this.loading = true;
      this.fileUploadService.uploadFile(filePath, file).subscribe(url => {
        this.loading = false;
        this.relevantDetails.coverImage = url;
        this.alertService.successMessage('Successfully uploaded banner.', 'Success');
      }, () => {
        this.loading = false;
        this.alertService.errorMessage('Failed to upload file. Please try again.', 'Error');
      });
    }
  }

  downloadSampleBanner() {
    const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/sparkc-ad442.appspot.com/o/talentboozt%2Fpublic%2Fbanner_size.jpg?alt=media&token=6db5aeaf-75dd-409b-98f0-91a32e31c172';
    const link = document.createElement('a');
    link.href = imageUrl;
    link.target = '_blank';
    link.download = 'sample_banner.png';
    link.click();
  }

  get selectedCurrency(): string {
    return this.relevantDetails.freeCheck ? '$' : this.relevantDetails.currency;
  }

  set selectedCurrency(value: string) {
    if (!this.relevantDetails.freeCheck) {
      this.relevantDetails.currency = value;
    }
  }

  get selectedPrice(): string {
    return this.relevantDetails.freeCheck ? '0' : this.relevantDetails.price;
  }

  set selectedPrice(value: string) {
    if (!this.relevantDetails.freeCheck) {
      this.relevantDetails.price = value;
    }
  }

  onFreeCheckChange() {
    if (this.relevantDetails.freeCheck) {
      this.relevantDetails.currency = '$';
      this.relevantDetails.price = '0';
    }
  }
}
