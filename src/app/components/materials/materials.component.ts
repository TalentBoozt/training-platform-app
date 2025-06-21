import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CoursesService} from '../../services/courses.service';
import {AlertsService} from '../../services/support/alerts.service';
import {finalize, tap} from 'rxjs';
import {NgForOf, NgIf} from '@angular/common';
import {MaterialsUploadFormComponent} from './materials-upload-form/materials-upload-form.component';
import {FileUploadService} from '../../services/support/file-upload.service';
import {
  CoursePreviewLoaderComponent
} from '../shared/cards/loaders/course-preview-loader/course-preview-loader.component';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-materials',
  imports: [
    NgForOf,
    MaterialsUploadFormComponent,
    NgIf,
    CoursePreviewLoaderComponent,
    FormsModule
  ],
  templateUrl: './materials.component.html',
  styleUrl: './materials.component.scss',
  standalone: true
})
export class MaterialsComponent implements OnInit{

  courseId: any
  moduleId: any
  materialId: any
  isEdit: boolean = false
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
      this.moduleId = params.get('moduleId');
    })

    this.route.queryParamMap.subscribe(params => {
      this.materialId = params.get('materialId');
      this.isEdit = params.get('edit') === 'true';
    })

    this.getCourse(this.courseId).subscribe(() => {
      this.modules = this.selectedCourse.modules.filter((module: any) => module.id === this.moduleId);
      this.materials = this.selectedCourse.materials

      if (this.materialId && this.isEdit) {
        this.getMaterial(this.materialId);
      }
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

  getMaterial(materialId: any) {
    const material = this.materials.find(m => m.id === materialId);
    if (material) {
      this.onEdit(material);
    }
  }

  onEdit(material: any): void {
    this.editMaterialsMap[material.moduleId] = material;
  }

  successUpload($event: any) {
    if ($event) {
      if (!this.materials) this.materials = [];
      if (!this.materials.find(m => m.id === $event.id)) this.materials.push($event);
      if (this.materials.find(m => m.id === $event.id)) this.materials = this.materials.map(m => m.id === $event.id ? $event : m);
    }
  }
}
