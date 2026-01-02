import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDraftService } from '../../../core/services/course-draft.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { tap } from 'rxjs';
import { RecCourseService } from '../../../core/services/rec-course.service';

@Component({
    selector: 'app-media-upload-step',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './media-upload-step.component.html',
    styleUrl: './media-upload-step.component.scss',
})
export class MediaUploadStepComponent implements OnInit {
    private fb = inject(FormBuilder);
    private draft = inject(CourseDraftService);
    private courseService = inject(RecCourseService);
    skillsArray: string[] = [];
    requirementsArray: string[] = [];
    selectedCategory: string = '';

    form = this.fb.group({
        language: ['English', Validators.required],
        category: ['', Validators.required],
        level: ['Beginner', Validators.required],
        skillsInput: [''],
        requirementsInput: [''],
        certificate: [false],
    });

    availableCategories: string[] = ['Technology', 'Marketing', 'Design', 'Health', 'Business'];
    filteredCategories: string[] = [];

    preferredLevels: string[] = ['Beginner', 'Intermediate', 'Advanced'];

    ngOnInit() {
        this.loadCategories().subscribe((categories: string[]) => {
            if (categories) {
                this.filteredCategories = this.availableCategories.filter(cat =>
                    categories.includes(cat)
                );
            }
        });

        const snap = this.draft.getSnapshot();
        this.form.patchValue({
            language: snap.language ?? 'English',
            category: snap.category ?? '',
            level: snap.level ?? 'Beginner',
            skillsInput: snap.skills?.join(', ') ?? '',
            requirementsInput: snap.requirements?.join(', ') ?? '',
            certificate: snap.certificate ?? false,
        });
        this.selectedCategory = snap.category ?? '';

        // Initialize the arrays from snapshot
        this.skillsArray = snap.skills ?? [];
        this.requirementsArray = snap.requirements ?? [];
    }

    // Update skillsArray when user types into skillsInput field
    onSkillsInput(event: any) {
        const input = event.target.value;
        if (input.includes(',')) {
            const newSkills = input.split(',').map((skill: any) => skill.trim());
            newSkills.forEach((skill: any) => {
                if (skill && !this.skillsArray.includes(skill)) {
                    this.skillsArray.push(skill);
                }
            });
            this.form.controls.skillsInput.setValue('');
        }
    }

    // Update requirementsArray when user types into requirementsInput field
    onRequirementsInput(event: any) {
        const input = event.target.value;
        if (input.includes(',')) {
            const newRequirements = input.split(',').map((requirement: any) => requirement.trim());
            newRequirements.forEach((requirement: any) => {
                if (requirement && !this.requirementsArray.includes(requirement)) {
                    this.requirementsArray.push(requirement);
                }
            });
            this.form.controls.requirementsInput.setValue('');
        }
    }

    // Remove skill from skillsArray
    removeSkill(skill: string) {
        this.skillsArray = this.skillsArray.filter((s) => s !== skill);
    }

    // Remove requirement from requirementsArray
    removeRequirement(requirement: string) {
        this.requirementsArray = this.requirementsArray.filter((r) => r !== requirement);
    }

    save() {
        if (this.form.invalid || !this.selectedCategory) {
            this.form.markAllAsTouched();
            return;
        }

        const { language, level, certificate } = this.form.value;
        const skills = this.skillsArray;
        const requirements = this.requirementsArray;

        if (language && level && skills.length && requirements.length !== undefined && certificate !== null && certificate !== undefined) {
            this.draft.update({
                language,
                category: this.selectedCategory,
                level,
                skills,
                requirements,
                certificate,
            });
        }
    }

    loadCategories() {
        return this.courseService.getAllCategories().pipe(
            tap(categories => {
                if (categories && categories.length > 0) {
                    this.availableCategories = Array.from(new Set([...this.availableCategories, ...categories]));
                }
            })
        );
    }

    // Handle category filtering manually
    filterCategories() {
        const categoryInput = this.selectedCategory.toLowerCase();
        if (categoryInput) {
            this.filteredCategories = this.availableCategories.filter(category => {
                if (!category) {
                    return false;
                }
                return category.toLowerCase().includes(categoryInput);
            });
        } else {
            this.filteredCategories = [];
        }
    }

    // When a category is selected from the dropdown
    selectCategory(category: string) {
        this.selectedCategory = category;
        this.form.patchValue({ category: category });  // Sync category with form
        this.filteredCategories = [];  // Optionally close the dropdown
    }

    // Add a new category to the available list
    addCategory() {
        const newCategory = this.selectedCategory;
        if (newCategory && !this.availableCategories.includes(newCategory)) {
            this.availableCategories.push(newCategory);
            this.form.patchValue({ category: newCategory });  // Sync with form
            this.filteredCategories = [];  // Close dropdown
        }
    }
}
