import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialsUploadFormComponent } from './materials-upload-form.component';

describe('MaterialsUploadFormComponent', () => {
  let component: MaterialsUploadFormComponent;
  let fixture: ComponentFixture<MaterialsUploadFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialsUploadFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialsUploadFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
