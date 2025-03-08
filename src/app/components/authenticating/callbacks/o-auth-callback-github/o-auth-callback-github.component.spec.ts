import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OAuthCallbackGithubComponent } from './o-auth-callback-github.component';

describe('OAuthCallbackGithubComponent', () => {
  let component: OAuthCallbackGithubComponent;
  let fixture: ComponentFixture<OAuthCallbackGithubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OAuthCallbackGithubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OAuthCallbackGithubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
