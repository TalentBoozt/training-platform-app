import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';
import {FileUploadService} from '../../../services/support/file-upload.service';
import {AlertsService} from '../../../services/support/alerts.service';
import {CoursesService} from '../../../services/courses.service';

@Component({
  selector: 'app-materials-upload-form',
  imports: [
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './materials-upload-form.component.html',
  styleUrl: './materials-upload-form.component.scss',
  standalone: true
})
export class MaterialsUploadFormComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() courseId!: string;
  @Input() moduleId!: string;
  @Input() editMaterial?: any;
  @Output() successUpload: EventEmitter<any> = new EventEmitter<any>();

  materialsForm!: FormGroup | any;
  uploadedFile?: File;

  uploading = false;

  constructor(private fb: FormBuilder,
              private alertService: AlertsService,
              private courseService: CoursesService,
              private fileUploadService: FileUploadService) {}

  ngOnInit(): void {
    this.materialsForm = this.fb.group({
      name: ['', Validators.required],
      type: ['pdf', Validators.required],
      category: ['book', Validators.required],
      uploadOption: ['url', Validators.required],
      url: [''],
    });
  }

  ngAfterViewInit(): void {
    if (this.editMaterial) {
      this.materialsForm.patchValue({
        name: this.editMaterial.name,
        type: this.editMaterial.type,
        category: this.editMaterial.category,
        uploadOption: this.editMaterial.url && !this.editMaterial.url.includes('firebase') ? 'url' : 'file',
        url: this.editMaterial.url
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editMaterial'] && this.editMaterial && this.materialsForm) {
      const material = this.editMaterial;
      const isUrl = material.url && !material.url.includes('firebase');
      this.materialsForm.patchValue({
        name: material.name,
        type: material.type,
        category: material.category,
        uploadOption: isUrl ? 'url' : 'file',
        url: isUrl ? material.url : ''
      });
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.materialsForm.invalid) return;

    const formValue = this.materialsForm.value;
    const dto = {
      id: this.editMaterial ? this.editMaterial.id : this.generateRandomString(16),
      courseId: this.courseId,
      moduleId: this.moduleId,
      name: formValue.name,
      type: formValue.type,
      url: formValue.uploadOption === 'url' ? formValue.url : null,
      category: formValue.category,
      visibility: 'participant', // default
      viewCount: 0
    };

    if (formValue.uploadOption === 'file') {
      const filePath = `trainingPlatform/courses/${this.courseId}/modules/${this.moduleId}/materials/`;
      const maxFileSize = 10 * 1024 * 1024;
      const allowedFileTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'text/plain',
        'image/png',
        'image/jpeg',
        'image/jpg'
      ];
      if (this.uploadedFile) {
        if (this.uploadedFile.size > maxFileSize) {
          this.alertService.warningMessage('File size exceeds the maximum limit of 10MB.', 'Warning');
          return;
        }
        if (!allowedFileTypes.includes(this.uploadedFile?.type)) {
          this.alertService.warningMessage('File type is not allowed.', 'Warning');
          return;
        }
        this.uploading = true;
        this.fileUploadService.uploadFile(filePath + this.uploadedFile.name, this.uploadedFile).subscribe(url => {
          this.uploading = false;
          dto.url = url;
          this.alertService.successMessage('File uploaded successfully.', 'Success');
          if (this.editMaterial && this.editMaterial.id) {
            this.updateMaterial(dto);
          } else {
            this.submit(dto);
          }
        }, () => {
          this.uploading = false;
          this.alertService.errorMessage('Failed to upload file. Please try again.', 'Error');
        });
      }
    } else {
      if (this.editMaterial && this.editMaterial.id) {
        this.updateMaterial(dto);
      } else {
        this.submit(dto);
      }
    }
  }

  submit(dto: any) {
    if (dto) {
      dto.uploadDate = new Date();
      this.courseService.addMaterial(dto).subscribe(() => {
        this.alertService.successMessage('Successfully uploaded material.', 'Success');
        this.successUpload.emit(dto);
        this.onReset();
      }, () => {
        this.alertService.errorMessage('Failed to upload material. Please try again.', 'Error');
      });
    }
  }

  updateMaterial(dto: any) {
    dto.updateDate = new Date();
    this.courseService.updateMaterial(dto).subscribe(() => {
      this.alertService.successMessage('Successfully updated material.', 'Success');
      this.successUpload.emit(dto);
      this.onReset();
    }, () => {
      this.alertService.errorMessage('Failed to update material. Please try again.', 'Error');
    });
  }

  generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  onReset() {
    this.materialsForm.reset({
      type: 'pdf',
      category: 'book',
      uploadOption: 'url'
    });
    this.editMaterial = undefined;
  }
}
