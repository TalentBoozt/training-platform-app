import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Card1x2LoaderComponent } from './card1x2-loader.component';

describe('Card1x2LoaderComponent', () => {
  let component: Card1x2LoaderComponent;
  let fixture: ComponentFixture<Card1x2LoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Card1x2LoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Card1x2LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
