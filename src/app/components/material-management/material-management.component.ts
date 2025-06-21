import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {CoursesService} from '../../services/courses.service';
import {finalize} from 'rxjs';
import {AlertsService} from '../../services/support/alerts.service';
import {FileUploadService} from '../../services/support/file-upload.service';

@Component({
  selector: 'app-material-management',
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './material-management.component.html',
  styleUrl: './material-management.component.scss',
  standalone: true
})
export class MaterialManagementComponent implements OnInit {

  courseId: string = '';
  course: any;
  modules: any[] = [];

  activeTab: string = 'materials';

  isUpdating: boolean = false;

  constructor(private route: ActivatedRoute,
              private courseService: CoursesService,
              private fileUploadService: FileUploadService,
              private router: Router,
              private alertService: AlertsService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.courseId = params['courseId'];
      this.getCourse(this.courseId);
    });
  }

  getCourse(courseId?: any) {
    if (!courseId) return;
    this.courseService.getCourseById(courseId).subscribe((course) => {
      this.course = course;
      this.modules = course.modules;
    });
  }

  getMaterialsByType(type: string, moduleId: string) {
    return this.course.materials?.filter(
      (m: any) => m.moduleId === moduleId && (type !== 'all' ? m.category === type : true)
    );
  }

  getQuizzesByModule(moduleId: string) {
    return this.course.quizzes?.filter((q: any) => q.moduleId === moduleId);
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

  getIconForVisibility(status: string): string {
    switch (status) {
      case 'public': return 'public';
      case 'participant': return 'people';
      case 'only-me': return 'lock';
      default: return 'help_outline';
    }
  }

  changeVisibility(status: string, material: any) {
    if (material.visibility === status || this.isUpdating) return;

    this.isUpdating = true;

    this.courseService.changeMaterialVisibility(this.courseId, material.id, status)
      .pipe(finalize(() => this.isUpdating = false))
      .subscribe({
        next: () => {
          material.visibility = status;
          this.alertService.successMessage('Visibility changed successfully.', 'Success');
        },
        error: (err) => {
          this.alertService.errorMessage(err.message, 'Error');
        }
      });
  }

  onAdd(moduleId: any, type: any) {
    if (moduleId) {
      if (type === 'quiz') {
        this.router.navigate(['courses', this.courseId, 'modules', moduleId, 'quizzes', 'upload']);
      } else if (type === 'material') {
        this.router.navigate(['courses', this.courseId, 'modules', moduleId, 'materials', 'upload']);
      }
    }
  }

  onEdit(moduleId: any, materialId: any, type: any) {
    if (moduleId) {
      if (type === 'quiz') {
        this.router.navigate(['courses', this.courseId, 'modules', moduleId, 'quizzes', 'upload'], {queryParams: {materialId, edit: true}});
      } else if (type === 'material') {
        this.router.navigate(['courses', this.courseId, 'modules', moduleId, 'materials', 'upload'], {queryParams: {materialId, edit: true}});
      }
    }
  }

  onDelete(material: any, type: any) {
    if (type === 'quiz') {
      if (!confirm(`Are you sure you want to delete "${material.name}"?`)) return;

      this.courseService.deleteQuiz(this.courseId, material.id).subscribe(() => {
        this.course.quizzes = this.course.quizzes.filter((q: any) => q.id !== material.id);
        this.alertService.successMessage('Quiz deleted successfully.', 'Success');
      }, () => {
        this.alertService.errorMessage('Failed to delete quiz from database.', 'Error');
      });
    } else if (type === 'material') {
      if (!confirm(`Are you sure you want to delete "${material.name}"?`)) return;

      const isFirebaseFile = material.url.includes('firebase');

      const deleteMaterial = () => {
        this.courseService.deleteMaterial(this.courseId, material.id).subscribe(() => {
          this.course.materials = this.course.materials.filter((m: any) => m.id !== material.id);
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
  }
}
