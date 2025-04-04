import { Routes } from '@angular/router';
import {AuthGuard} from './guards/auth.guard';

export const routes: Routes = [
  {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  {path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent), canActivate: [AuthGuard]},
  {path: 'post-course', loadComponent: () => import('./components/post-course/post-course.component').then(c => c.PostCourseComponent), canActivate: [AuthGuard]},
  {path: 'participants', loadComponent: () => import('./components/participants/participants.component').then(c => c.ParticipantsComponent), canActivate: [AuthGuard]},
  {path: 'courses', loadComponent: () => import('./components/my-courses/my-courses.component').then(c => c.MyCoursesComponent), canActivate: [AuthGuard]},
  {path: 'preview/:courseId', loadComponent: () => import('./components/preview-course/preview-course.component').then(c => c.PreviewCourseComponent)},
  {path: 'preview-course/:courseId', loadComponent: () => import('./components/course-modules/course-modules.component').then(c => c.CourseModulesComponent)},
  {path: 'edit-modules/:courseId', loadComponent: () => import('./components/update-modules/update-modules.component').then(c => c.UpdateModulesComponent), canActivate: [AuthGuard]},
  {path: 'oauth-callback', loadComponent: () => import('./components/authenticating/callbacks/o-auth-callback/o-auth-callback.component').then(m => m.OAuthCallbackComponent)},
  {path: 'oauth-callback/github', loadComponent: () => import('./components/authenticating/callbacks/o-auth-callback-github/o-auth-callback-github.component').then(m => m.OAuthCallbackGithubComponent)},
  {path: 'oauth-callback/linkedin', loadComponent: () => import('./components/authenticating/callbacks/o-auth-callback-linkedin/o-auth-callback-linkedin.component').then(m => m.OAuthCallbackLinkedinComponent)},
  {path: 'locked', loadComponent: () => import('./components/authenticating/lock-screen/lock-screen.component').then(m => m.LockScreenComponent)},
  {path: 'login', loadComponent: () => import('./components/authenticating/login/login.component').then(m => m.LoginComponent)},
  {path: 'register', loadComponent: () => import('./components/authenticating/register/register.component').then(m => m.RegisterComponent)},
  {path: 'reset', loadComponent: () => import('./components/authenticating/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)},
  {path: 'reset-password', loadComponent: () => import('./components/authenticating/reset-password-form/reset-password-form.component').then(m => m.ResetPasswordFormComponent)},
];
