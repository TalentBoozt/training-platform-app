import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelavantDetailsComponent } from './relavant-details.component';

describe('RelavantDetailsComponent', () => {
  let component: RelavantDetailsComponent;
  let fixture: ComponentFixture<RelavantDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelavantDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelavantDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
