import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardFullLoaderComponent } from './card-full-loader.component';

describe('CardFullLoaderComponent', () => {
  let component: CardFullLoaderComponent;
  let fixture: ComponentFixture<CardFullLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardFullLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardFullLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
