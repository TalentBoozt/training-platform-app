import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  selector: 'instructor-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="instructor-card-container">
      <div class="avatar-wrapper">
        <img [src]="avatar" alt="Instructor avatar" />
        <span class="status-dot"></span>
      </div>
      <div class="instructor-info">
        <h6>{{ name }}</h6>
        <p>{{ bio }}</p>
      </div>
    </div>
  `,
  styleUrl: './instructor-card.component.scss'
})
export class InstructorCardComponent {
  @Input() name = 'John Doe';
  @Input() bio = 'Instructor & Content Creator';
  @Input() avatar = 'https://www.sit.edu/wp-content/uploads/placeholder-facstaff-img-600x600.png';
}
