import { Routes } from '@angular/router';
import {AuthGuard} from './guards/auth.guard';

export const routes: Routes = [
  {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  {path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent)},
  {path: 'post-course', loadComponent: () => import('./components/post-course/course-type/course-type.component').then(c => c.CourseTypeComponent), canActivate: [AuthGuard]},
  {path: 'post-live', loadComponent: () => import('./components/post-course/post-course.component').then(c => c.PostCourseComponent), canActivate: [AuthGuard]},
  {path: 'participants', loadComponent: () => import('./components/participants/participants.component').then(c => c.ParticipantsComponent), canActivate: [AuthGuard]},
  {path: 'courses', loadComponent: () => import('./components/my-courses/my-courses.component').then(c => c.MyCoursesComponent), canActivate: [AuthGuard]},
  {path: 'preview/:courseId', loadComponent: () => import('./components/preview-course/preview-course.component').then(c => c.PreviewCourseComponent)},
  {path: 'preview-course/:courseId', loadComponent: () => import('./components/course-modules/course-modules.component').then(c => c.CourseModulesComponent)},
  {path: 'edit-modules/:courseId', loadComponent: () => import('./components/update-modules/update-modules.component').then(c => c.UpdateModulesComponent), canActivate: [AuthGuard]},
  {path: 'courses/:courseId/modules/:moduleId/materials/upload', loadComponent: () => import('./components/materials/materials.component').then(c => c.MaterialsComponent), canActivate: [AuthGuard]},
  {path: 'courses/:courseId/modules/:moduleId/quizzes/upload', loadComponent: () => import('./components/quiz-manager/quiz-manager.component').then(c => c.QuizManagerComponent), canActivate: [AuthGuard]},
  {path: 'manage-materials/:courseId', loadComponent: () => import('./components/material-management/material-management.component').then(c => c.MaterialManagementComponent), canActivate: [AuthGuard]},
  {path: 'quiz/:courseId/:quizId', loadComponent: () => import('./components/quizzes/quiz-detail/quiz-detail.component').then(c => c.QuizDetailComponent), canActivate: [AuthGuard]},
  {path: 'oauth-callback', loadComponent: () => import('./components/authenticating/callbacks/o-auth-callback/o-auth-callback.component').then(m => m.OAuthCallbackComponent)},
  {path: 'oauth-callback/github', loadComponent: () => import('./components/authenticating/callbacks/o-auth-callback-github/o-auth-callback-github.component').then(m => m.OAuthCallbackGithubComponent)},
  {path: 'oauth-callback/linkedin', loadComponent: () => import('./components/authenticating/callbacks/o-auth-callback-linkedin/o-auth-callback-linkedin.component').then(m => m.OAuthCallbackLinkedinComponent)},
  {path: 'locked', loadComponent: () => import('./components/authenticating/lock-screen/lock-screen.component').then(m => m.LockScreenComponent)},
  {path: 'login', loadComponent: () => import('./components/authenticating/login/login.component').then(m => m.LoginComponent)},
  {path: 'register', loadComponent: () => import('./components/authenticating/register/register.component').then(m => m.RegisterComponent)},
  {path: 'reset', loadComponent: () => import('./components/authenticating/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)},
  {path: 'reset-password', loadComponent: () => import('./components/authenticating/reset-password-form/reset-password-form.component').then(m => m.ResetPasswordFormComponent)},
  {path: 'captcha-challenge', loadComponent: () => import('./components/authenticating/captcha-challenge/captcha-challenge.component').then(m => m.CaptchaChallengeComponent)},
];
