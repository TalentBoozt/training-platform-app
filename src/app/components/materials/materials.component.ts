import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CoursesService} from '../../services/courses.service';
import {AlertsService} from '../../services/support/alerts.service';
import {tap} from 'rxjs';
import {NgForOf, NgIf} from '@angular/common';
import {MaterialsUploadFormComponent} from './materials-upload-form/materials-upload-form.component';
import {FileUploadService} from '../../services/support/file-upload.service';
import {
  CoursePreviewLoaderComponent
} from '../shared/cards/loaders/course-preview-loader/course-preview-loader.component';

@Component({
  selector: 'app-materials',
  imports: [
    NgForOf,
    MaterialsUploadFormComponent,
    NgIf,
    CoursePreviewLoaderComponent
  ],
  templateUrl: './materials.component.html',
  styleUrl: './materials.component.scss',
  standalone: true
})
export class MaterialsComponent implements OnInit{

  courseId: any
  selectedCourse: any;
  modules: any[] = [];
  materials: any[] = [];
  loading: boolean = false;
  editMaterialsMap: { [moduleId: string]: any } = {};

  constructor(private route: ActivatedRoute,
              private courseService: CoursesService,
              private fileUploadService: FileUploadService,
              private alertService: AlertsService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('courseId');
    })

    this.getCourse(this.courseId).subscribe(() => {
      this.modules = this.selectedCourse.modules
      this.materials = this.selectedCourse.materials
    });
  }

  getCourse(courseId?: any) {
    this.loading = true;
    return this.courseService.getCourseById(courseId).pipe(
      tap((course: any) => {
        this.selectedCourse = course;
        this.loading = false;
      }, error => {
        this.alertService.errorMessage(error.message, 'Error');
        this.loading = false;
      })
    )
  }

  filterMaterialsByModule(moduleId: any) {
    return this.materials.filter(m => m.moduleId === moduleId);
  }

  getMaterialIcon(url: string): string {
    if (!url) return 'assets/icons/file.png';

    url = url.toLowerCase();

    if (url.includes('drive.google.com')) return 'assets/icons/drive.png';
    if (url.includes('dropbox.com')) return 'assets/icons/dropbox.png';
    if (url.includes('firebase')) return 'assets/icons/firebase.png';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'assets/icons/youtube.png';
    if (url.includes('amazonaws.com')) return 'assets/icons/amazon.png';
    if (url.includes('github.com') || url.includes('raw.githubusercontent.com')) return 'assets/icons/github.png';
    if (url.includes('icloud.com')) return 'assets/icons/icloud.png';
    if (url.includes('linkedin.com')) return 'assets/icons/linkedin.png';
    if (url.includes('mega.nz')) return 'assets/icons/mega.png';
    if (url.includes('onedrive.live.com') || url.includes('1drv.ms')) return 'assets/icons/onedrive.png';

    return 'assets/icons/file.png'; // fallback
  }

  onEdit(material: any): void {
    this.editMaterialsMap[material.moduleId] = material;
  }

  onDelete(material: any): void {
    if (!confirm(`Are you sure you want to delete "${material.name}"?`)) return;

    const isFirebaseFile = material.url.includes('firebase');

    const deleteMaterial = () => {
      this.courseService.deleteMaterial(this.courseId, material.id).subscribe(() => {
        this.materials = this.materials.filter(m => m.id !== material.id);
        this.alertService.successMessage('Material deleted successfully.', 'Success');
      }, () => {
        this.alertService.errorMessage('Failed to delete material from database.', 'Error');
      });
    };

    if (isFirebaseFile) {
      this.fileUploadService.deleteFile(material.url).subscribe(() => {
        deleteMaterial();
      }, () => {
        this.alertService.errorMessage('Failed to delete file from Firebase.', 'Error');
      });
    } else {
      deleteMaterial();
    }
  }


  successUpload($event: any) {
    if ($event) {
      if (!this.materials) this.materials = [];
      if (!this.materials.find(m => m.id === $event.id)) this.materials.push($event);
      if (this.materials.find(m => m.id === $event.id)) this.materials = this.materials.map(m => m.id === $event.id ? $event : m);
    }
  }
}
