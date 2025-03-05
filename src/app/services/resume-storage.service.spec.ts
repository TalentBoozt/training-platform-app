import { TestBed } from '@angular/core/testing';

import { ResumeStorageService } from './resume-storage.service';

describe('ResumeStorageService', () => {
  let service: ResumeStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResumeStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
