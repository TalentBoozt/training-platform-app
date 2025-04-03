import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateModulesComponent } from './update-modules.component';

describe('UpdateModulesComponent', () => {
  let component: UpdateModulesComponent;
  let fixture: ComponentFixture<UpdateModulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateModulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
