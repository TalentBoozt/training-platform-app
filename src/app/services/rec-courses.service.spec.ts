import { TestBed } from '@angular/core/testing';

import { RecCoursesService } from './rec-courses.service';

describe('RecCoursesService', () => {
  let service: RecCoursesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecCoursesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
