import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'rating-stars',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rating-container">
      <span class="rating-score">{{ rating }}</span>
      <div class="stars-wrapper">
        <i *ngFor="let star of stars; let i = index" class="fa-star"
           [class.fas]="i < rating" [class.far]="i >= rating"></i>
      </div>
      <span class="total-ratings">({{ total }} ratings)</span>
    </div>
  `,
  styleUrl: './rating-stars.component.scss'
})
export class RatingStarsComponent {
  @Input() rating: number = 4.5; // Default valid rating
  @Input() total: number = 0;
  stars = Array(5);
}
