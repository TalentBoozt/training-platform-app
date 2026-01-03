import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RecCoursesService } from '../../services/rec-courses.service';
import { AlertsService } from '../../services/support/alerts.service';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';

@Component({
    selector: 'app-edit-rec-course-modules',
    imports: [
        FormsModule,
        NgIf,
        NgForOf
    ],
    templateUrl: './edit-rec-course-modules.component.html',
    styleUrl: './edit-rec-course-modules.component.scss',
    standalone: true
})
export class EditRecCourseModulesComponent implements OnInit {

    courseId: string = '';
    modules: any[] = [];

    // State for Module Editing
    editingModuleId: string | null = null;
    newModule: any = {
        title: '',
        description: ''
    };

    // State for Lecture Editing
    editingLectureId: string | null = null; // if null, creating new lecture
    activeModuleId: string | null = null; // which module we are adding/editing lecture for
    newLecture: any = {
        title: '',
        description: '',
        videoUrl: '', // user mentioned can be remote or upload
        duration: 0,
        freePreview: false
    };

    showLectureForm = false;

    constructor(
        private recCoursesService: RecCoursesService,
        private route: ActivatedRoute,
        private alertService: AlertsService
    ) { }

    ngOnInit() {
        this.courseId = this.route.snapshot.paramMap.get('courseId') || '';
        if (this.courseId) {
            this.loadCourse();
        }
    }

    loadCourse() {
        this.recCoursesService.getCourseById(this.courseId).subscribe({
            next: (course) => {
                this.modules = course.modules || [];
            },
            error: (err) => {
                this.alertService.errorMessage('Failed to load course modules', 'Error');
            }
        });
    }

    // --- Module Operations ---

    addModule() {
        if (!this.newModule.title) {
            this.alertService.errorMessage('Module title is required', 'Error');
            return;
        }

        // Optimistic UI update or wait for backend? 
        // Service has placeholder Observable. 
        this.recCoursesService.addModule(this.courseId, { ...this.newModule }).subscribe((addedModule) => {
            // In real backend, addedModule would have ID. 
            // For now, if mock, we simulate.
            if (!addedModule.id) addedModule.id = 'temp_' + Date.now();
            if (!addedModule.lectures) addedModule.lectures = [];

            this.modules.push(addedModule);
            this.newModule = { title: '', description: '' };
            this.alertService.successMessage('Module added (placeholder)', 'Success');
        });
    }

    deleteModule(index: number, module: any) {
        if (confirm('Delete this module and all its lectures?')) {
            this.recCoursesService.deleteModule(this.courseId, module.id).subscribe(() => {
                this.modules.splice(index, 1);
                this.alertService.successMessage('Module deleted (placeholder)', 'Success');
            });
        }
    }

    // --- Lecture Operations ---

    openAddLectureForm(moduleId: string) {
        this.activeModuleId = moduleId;
        this.editingLectureId = null;
        this.newLecture = { title: '', description: '', videoUrl: '', duration: 0, freePreview: false };
        this.showLectureForm = true;
    }

    editLecture(moduleId: string, lecture: any) {
        this.activeModuleId = moduleId;
        this.editingLectureId = lecture.id;
        this.newLecture = { ...lecture };
        this.showLectureForm = true;
    }

    cancelLectureForm() {
        this.showLectureForm = false;
        this.activeModuleId = null;
    }

    saveLecture() {
        if (!this.newLecture.title) {
            this.alertService.errorMessage('Lecture title is required', 'Error');
            return;
        }

        if (!this.activeModuleId) return;

        // Find module index
        const moduleIndex = this.modules.findIndex(m => m.id === this.activeModuleId);
        if (moduleIndex === -1) return;

        // TODO: Call Service
        this.recCoursesService.addLecture(this.courseId, this.activeModuleId, this.newLecture).subscribe((savedLecture) => {
            // Simulate save
            if (!this.modules[moduleIndex].lectures) this.modules[moduleIndex].lectures = [];

            if (this.editingLectureId) {
                // Update existing
                const lecIndex = this.modules[moduleIndex].lectures.findIndex((l: any) => l.id === this.editingLectureId);
                if (lecIndex !== -1) {
                    this.modules[moduleIndex].lectures[lecIndex] = { ...savedLecture, id: this.editingLectureId };
                }
            } else {
                // Add new
                this.modules[moduleIndex].lectures.push({ ...savedLecture, id: 'lec_' + Date.now() });
            }

            this.showLectureForm = false;
            this.alertService.successMessage('Lecture saved (placeholder)', 'Success');
        });
    }

    deleteLecture(moduleId: string, lectureIndex: number) {
        const moduleIndex = this.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex === -1) return;

        if (confirm('Delete this lecture?')) {
            this.modules[moduleIndex].lectures.splice(lectureIndex, 1);
            // TODO: Call delete endpoint
        }
    }
}
