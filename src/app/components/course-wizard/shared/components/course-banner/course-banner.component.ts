import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'course-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="banner-wrapper mb-4">
      <div class="overlay"></div>
      <img [src]="imageUrl" alt="Course banner" />
    </div>
  `,
  styleUrl: './course-banner.component.scss'
})
export class CourseBannerComponent {
  @Input() imageUrl = 'https://via.placeholder.com/1200x350?text=Course+Banner';
}
