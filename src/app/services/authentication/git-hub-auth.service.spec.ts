import { TestBed } from '@angular/core/testing';

import { GitHubAuthService } from './git-hub-auth.service';

describe('GitHubAuthService', () => {
  let service: GitHubAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GitHubAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
