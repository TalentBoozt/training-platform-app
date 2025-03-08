import { TestBed } from '@angular/core/testing';

import { LinkedInAuthService } from './linked-in-auth.service';

describe('LinkedInAuthService', () => {
  let service: LinkedInAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LinkedInAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
