import { Routes } from '@angular/router';

export const COURSE_WIZARD_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./course-wizard-shell.component').then(m => m.CourseWizardShellComponent),
        children: [
            {
                path: '',
                redirectTo: 'basic',
                pathMatch: 'full',
            },
            // {
            //   path: 'type',
            //   loadComponent: () => import('./steps/type-selection/type-selection-step/type-selection-step.component').then(m => m.TypeSelectionStepComponent),
            // },
            {
                path: 'basic',
                loadComponent: () => import('./steps/basic-details/basic-details-step/basic-details-step.component').then(m => m.BasicDetailsStepComponent),
            },
            {
                path: 'modules',
                loadComponent: () => import('./steps/modules/modules-step/modules-step.component').then(m => m.ModulesStepComponent),
            },
            // {
            //   path: 'pricing',
            //   loadComponent: () => import('./steps/pricing/pricing-step/pricing-step.component').then(m => m.PricingStepComponent),
            // },
            {
                path: 'pricing',
                loadComponent: () => import('./steps/pricing/pricing-step/pricing-step.component').then(m => m.PricingStepComponent),
            },
            {
                path: 'course',
                loadComponent: () => import('./steps/media-upload/media-upload-step/media-upload-step.component').then(m => m.MediaUploadStepComponent),
            },
            {
                path: 'preview',
                loadComponent: () => import('./steps/preview-publish/preview-publish-step/preview-publish-step.component').then(m => m.PreviewPublishStepComponent),
            },
        ],
    },
];
