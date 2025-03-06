import {Component, OnInit} from '@angular/core';
import {RichTextEditorComponent} from '../../shared/elements/rich-text-editor/rich-text-editor.component';
import {ResumeStorageService} from '../../../services/resume-storage.service';
import {AlertsService} from '../../../services/alerts.service';

@Component({
  selector: 'app-course-details',
  imports: [
    RichTextEditorComponent
  ],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.scss',
  standalone: true
})
export class CourseDetailsComponent implements OnInit {
  courseContent: any;

  constructor(private resumeStorage: ResumeStorageService, private alertService: AlertsService) {}

  ngOnInit(): void {
    const savedData = this.resumeStorage.getData();
    if (savedData?.courseContent) {
      this.courseContent = savedData.courseContent;
    }
  }

  saveContent($event: any) {
    if ($event) {
      this.courseContent = $event;
      this.resumeStorage.saveData('courseContent', this.courseContent);
      this.alertService.successMessage('Course details saved! Go to the next step', 'Success');
    } else {
      this.alertService.errorMessage('Please add some content!', 'Error');
    }
  }
}
