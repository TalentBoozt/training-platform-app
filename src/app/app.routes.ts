import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/post-course',
    pathMatch: 'full'
  },
  {
    path: 'post-course',
    loadComponent: () => import('./components/post-course/post-course.component').then(c => c.PostCourseComponent)
  }
];
