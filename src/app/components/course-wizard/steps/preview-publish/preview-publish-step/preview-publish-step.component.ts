import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDraftService } from '../../../core/services/course-draft.service';
import { VideoPreviewComponent } from '../../../shared/components/video-preview/video-preview.component';
import { CourseBannerComponent } from '../../../shared/components/course-banner/course-banner.component';
import { InstructorCardComponent } from '../../../shared/components/instructor-card/instructor-card.component';
import { RatingStarsComponent } from '../../../shared/components/rating-stars/rating-stars.component';
import { LectureCardComponent } from '../../../shared/components/lecture-card/lecture-card.component';
import { RecCourseService } from '../../../core/services/rec-course.service';
import { AuthService } from '../../../../../services/support/auth.service';

@Component({
    selector: 'app-preview-publish-step',
    standalone: true,
    imports: [
        CommonModule,
        VideoPreviewComponent,
        CourseBannerComponent,
        InstructorCardComponent,
        RatingStarsComponent,
        LectureCardComponent
    ],
    templateUrl: './preview-publish-step.component.html',
    styleUrl: './preview-publish-step.component.scss',
})
export class PreviewPublishStepComponent {
    private draftService = inject(CourseDraftService);
    private courseService = inject(RecCourseService);
    private authService = inject(AuthService); // Replaced CookieService with AuthService
    snapshot = this.draftService.getSnapshot();

    publish() {
        if (!this.validateSnapshot()) {
            alert('Please complete all required fields before publishing.');
            return;
        }

        // Replaced cookie access with AuthService methods
        const companyId = this.authService.organization();
        const userId = this.authService.userID();

        if (companyId && userId) {
            this.snapshot.published = true;
            this.snapshot.updatedAt = new Date().toISOString();
            this.snapshot.companyId = companyId;
            this.snapshot.trainerId = userId;
            // Also maybe add user display name if available?

            this.draftService.setFullDraft(this.snapshot);
            this.courseService.addCourse(this.snapshot).subscribe({
                next: () => {
                    alert('Course published successfully!');
                    // Redirect or reset?
                },
                error: (err: any) => {
                    console.error(err);
                    alert('Failed to publish course. Please try again.');
                }
            });
        } else {
            alert('Failed to publish course. Please try again. Company ID or User ID not found.');
        }
    }

    firstLectureWithVideoUrl() {
        for (const mod of this.snapshot.modules || []) {
            for (const lec of mod.lectures || []) {
                if (lec.videoUrl) {
                    return lec;
                }
            }
        }
        return null;
    }

    validateSnapshot(): boolean {
        if (!this.snapshot.title?.trim()) return false;
        if (!this.snapshot.description?.trim()) return false;
        // Check if at least one module exists
        if (!this.snapshot.modules || this.snapshot.modules.length === 0) return false;

        for (const mod of this.snapshot.modules || []) {
            if (!mod.title?.trim()) return false;
            // Check if at least one lecture exists in module
            if (!mod.lectures || mod.lectures.length === 0) return false;

            for (const lec of mod.lectures || []) {
                if (!lec.title?.trim()) return false;
                // Video or materials required? Assuming logic from source
                if (!lec.videoUrl && !(lec.materials && lec.materials.length > 0)) return false;
            }
        }
        return true;
    }
}
