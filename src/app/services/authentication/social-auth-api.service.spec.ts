import { TestBed } from '@angular/core/testing';

import { SocialAuthApiService } from './social-auth-api.service';

describe('SocialAuthApiService', () => {
  let service: SocialAuthApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocialAuthApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
