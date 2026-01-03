import { Injectable, inject, resource, computed, signal } from '@angular/core';
import { format, utcToZonedTime } from 'date-fns-tz';
import { forkJoin, of, firstValueFrom, timer, tap, filter, retry } from 'rxjs';
import { catchError, map, take, timeout } from 'rxjs/operators';

import { CoursesService } from '../courses.service';
import { RecCoursesService } from '../rec-courses.service';
import { EmployeeAuthStateService } from '../cacheStates/employee-auth-state.service';

@Injectable({ providedIn: 'root' })
export class CourseStoreService {
  private courseService = inject(CoursesService);
  private recCoursesService = inject(RecCoursesService);
  private authState = inject(EmployeeAuthStateService);

  private readonly tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  public searchQuery = signal('');
  public companyId = signal<string | undefined>(undefined);

  constructor() {
    this.authState.employee$.subscribe(profile => {
      this.companyId.set(profile?.employee?.companyId);
    });
  }

  readonly courseResource = resource({
    request: () => ({ cid: this.companyId() }),
    loader: ({ request }) => {
      if (!request.cid) return Promise.resolve({ live: [], recorded: [], all: [] });

      return firstValueFrom(
        forkJoin({
          live: this.loadLiveCourses(request.cid),
          recorded: this.loadRecordedCourses(request.cid)
        }).pipe(
          // SAFETY GUARD:
          // If data takes longer than 10 seconds, force an error so the app opens anyway.
          timeout(10000),
          map((results) => ({
            live: results.live,
            recorded: results.recorded,
            all: [...results.live, ...results.recorded]
          })),
          catchError((err) => {
            console.error('☠️ STORE CRITICAL FAILURE:', err);
            // Return empty state so the app can still open
            return of({ live: [], recorded: [], all: [] });
          })
        )
      );
    }
  });

  // ------------------------------------------------------
  // SIGNALS
  // ------------------------------------------------------
  readonly liveCourses$ = computed(() => this.courseResource.value()?.live ?? []);
  readonly recordedCourses$ = computed(() => this.courseResource.value()?.recorded ?? []);
  readonly allCourses$ = computed(() => this.courseResource.value()?.all ?? []);
  readonly loading$ = computed(() => this.courseResource.isLoading());
  readonly error$ = computed(() => this.courseResource.error());

  refresh() {
    this.courseResource.reload();
  }

  // ------------------------------------------------------
  // LOADERS
  // ------------------------------------------------------
  private loadLiveCourses(companyId: string) {
    return this.courseService.getCoursesByOrganization(companyId).pipe(
      filter(courses => courses !== null && courses !== undefined),
      take(1),
      map((courses: any) => {
        if (!Array.isArray(courses)) {
          console.error('Live Courses is not an array!', courses);
          return [];
        }
        return courses
          // .filter((c: any) => c?.publicity) // Removed to show all courses
          .map((c: any) => this.mapLiveCourse(c))
      }),
      retry(2),
      catchError(e => {
        console.error('Error fetching Live Courses:', e);
        return of([]);
      })
    );
  }

  private loadRecordedCourses(companyId: string) {
    return this.recCoursesService.getCoursesByCompanyId(companyId).pipe(
      filter(courses => courses !== null && courses !== undefined),
      take(1),
      map((courses: any[]) => {
        if (!Array.isArray(courses)) {
          console.error('Recorded Courses is not an array!', courses);
          return [];
        }
        return courses
          .map(c => ({ ...c, name: c.title, courseType: 'recorded' }))
      }),
      retry(2),
      catchError(e => {
        console.error('Error fetching Recorded Courses:', e);
        return of([]);
      })
    );
  }

  // SAFE MAPPER: Removes Date parsing complexity to rule it out
  private mapLiveCourseSafe(course: any) {
    try {
      // Just return raw strings for now to test if data appears
      return {
        ...course,
        courseType: 'live',
        // If these fields exist, use them, otherwise use raw UTC
        startDate: course.utcStart ? course.utcStart.split('T')[0] : '2024-01-01',
        fromTime: '10:00',
        toTime: '11:00'
      };
    } catch (e) {
      return course;
    }
  }

  private mapLiveCourse(course: any) {
    try {
      // Using date-fns-tz v2 syntax as per your package.json
      // Ensure utcStart exists
      if (!course.utcStart) return { ...course, courseType: 'live', startDate: 'N/A', fromTime: '--:--', toTime: '--:--' };

      const start = utcToZonedTime(course.utcStart, this.tz);
      const end = course.utcEnd ? utcToZonedTime(course.utcEnd, this.tz) : start;

      return {
        ...course,
        courseType: 'live',
        startDate: format(start, 'yyyy-MM-dd', { timeZone: this.tz }),
        fromTime: format(start, 'HH:mm', { timeZone: this.tz }),
        toTime: format(end, 'HH:mm', { timeZone: this.tz })
      };
    } catch (e) {
      console.error('Error mapping live course:', course.name, e);
      return { ...course, courseType: 'live', startDate: 'Error', fromTime: '--:--', toTime: '--:--' };
    }
  }
}
