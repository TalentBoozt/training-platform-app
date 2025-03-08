import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OAuthCallbackLinkedinComponent } from './o-auth-callback-linkedin.component';

describe('OAuthCallbackLinkedinComponent', () => {
  let component: OAuthCallbackLinkedinComponent;
  let fixture: ComponentFixture<OAuthCallbackLinkedinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OAuthCallbackLinkedinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OAuthCallbackLinkedinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
