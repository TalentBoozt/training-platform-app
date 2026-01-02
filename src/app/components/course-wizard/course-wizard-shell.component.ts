import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CourseDraftService } from './core/services/course-draft.service';
import { TruncatePipe } from './shared/pipes/truncate.pipe';
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'app-course-wizard-shell',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, TruncatePipe],
    templateUrl: './course-wizard-shell.component.html',
    styleUrl: './course-wizard-shell.component.scss',
})
export class CourseWizardShellComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private draftService = inject(CourseDraftService);

    course = this.draftService.draft$; // Renamed from draft to match template
    activeIndex = signal(0);
    progress = signal(0);
    saving = false;
    isNew = this.route.snapshot.queryParamMap.get('type') === 'new';

    steps = [
        { id: '1', path: 'basic', label: 'Basic Details', icon: 'fas fa-info-circle' },
        { id: '2', path: 'course', label: 'Course Details', icon: 'fa-solid fa-building-columns' },
        { id: '3', path: 'modules', label: 'Modules & Lectures', icon: 'fa-solid fa-video' },
        { id: '4', path: 'pricing', label: 'Pricing & Access', icon: 'fa-solid fa-dollar-sign' },
        { id: '5', path: 'preview', label: 'Preview & Publish', icon: 'fa-solid fa-eye' },
    ];

    ngOnInit(): void {
        const url = this.router.url;
        this.activeIndex.set(this.indexFromUrl(url));

        this.router.events.subscribe(() => {
            this.activeIndex.set(this.indexFromUrl(this.router.url));
        });

        if (this.isNew) {
            this.course().published = false;
            this.course().approved = false;
            this.course().createdAt = new Date().toISOString();
            this.course().updatedAt = new Date().toISOString();
            this.course().id = uuidv4();
        }

        this.updateProgress();
    }

    private indexFromUrl(url: string) {
        for (let i = 0; i < this.steps.length; i++) {
            if (url.includes(this.steps[i].path)) return i;
        }
        return 0;
    }

    goTo(i: number) {
        const path = this.steps[i].path;
        this.router.navigate([path], { relativeTo: this.route }).then();
        this.activeIndex.set(i);
    }

    exit() {
        this.router.navigate(['/dashboard']);
    }

    isActive(path: string): boolean {
        return this.router.url.includes(path);
    }

    // Helper used in template
    getProgress() {
        return this.progress();
    }

    stepCompleted(step: any): boolean {
        const idx = this.steps.indexOf(step);
        return this.isStepCompleted(idx);
    }

    isStepCompleted(index: number): boolean {
        const draft = this.draftService.getSnapshot();
        switch (index) {
            case 0: // basic
                return !!(draft.title && draft.description);
            case 1: // course (media/details mixed)
                return !!(draft.language && draft.category);
            case 2: // modules
                return (draft.modules?.length || 0) > 0;
            case 3: // pricing
                return draft.price !== null && draft.price !== undefined;
            case 4: // preview
                return !!draft.published;
            default:
                return false;
        }
    }

    updateProgress() {
        const total = this.steps.length;
        let done = 0;
        for (let i = 0; i < total; i++) {
            if (this.isStepCompleted(i)) done++;
        }
        const pct = Math.round((done / total) * 100);
        this.progress.set(pct);
    }

    saveDraft() {
        this.saving = true;
        this.draftService.update({});
        this.updateProgress();
        setTimeout(() => {
            this.saving = false;
        }, 800);
    }
}
