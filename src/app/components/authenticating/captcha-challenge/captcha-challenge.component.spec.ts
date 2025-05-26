import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptchaChallengeComponent } from './captcha-challenge.component';

describe('CaptchaChallengeComponent', () => {
  let component: CaptchaChallengeComponent;
  let fixture: ComponentFixture<CaptchaChallengeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaptchaChallengeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaptchaChallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
