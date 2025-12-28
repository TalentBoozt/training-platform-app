import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CourseDraftService } from '../../../core/services/course-draft.service';
import { emailExistsValidator } from '../../../core/utils/validators/emailExistsValidator';

@Component({
    selector: 'app-basic-details-step',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './basic-details-step.component.html',
    styleUrl: './basic-details-step.component.scss',
})
export class BasicDetailsStepComponent implements OnInit {
    private fb = inject(FormBuilder);
    private draft = inject(CourseDraftService);
    form = this.fb.group({
        title: ['', Validators.required],
        subtitle: [''],
        lecturer: ['', Validators.required],
        lecturerNameTag: [''],
        lecturerEmail: ['', [Validators.required, Validators.email], [emailExistsValidator()]],
        description: ['', Validators.required],
    });

    ngOnInit() {
        const snap = this.draft.getSnapshot();
        this.form.patchValue({
            title: snap.title ?? '',
            subtitle: snap.subtitle ?? '',
            lecturer: snap.lecturer ?? '',
            lecturerNameTag: snap.lecturerNameTag ?? '',
            lecturerEmail: snap.lecturerEmail ?? '',
            description: snap.description ?? '',
        });
    }

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const { title, subtitle, lecturer, lecturerNameTag, lecturerEmail, description } = this.form.value;
        if (title && subtitle && lecturer && lecturerEmail && lecturerNameTag && description) {
            this.draft.update({ title, subtitle, lecturer, lecturerNameTag, lecturerEmail, description });
        }
    }
}
