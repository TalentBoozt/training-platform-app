import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursePreviewLoaderComponent } from './course-preview-loader.component';

describe('CoursePreviewLoaderComponent', () => {
  let component: CoursePreviewLoaderComponent;
  let fixture: ComponentFixture<CoursePreviewLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursePreviewLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursePreviewLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
