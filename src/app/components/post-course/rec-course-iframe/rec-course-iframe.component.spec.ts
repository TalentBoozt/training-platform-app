import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecCourseIframeComponent } from './rec-course-iframe.component';

describe('RecCourseIframeComponent', () => {
  let component: RecCourseIframeComponent;
  let fixture: ComponentFixture<RecCourseIframeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecCourseIframeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecCourseIframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
