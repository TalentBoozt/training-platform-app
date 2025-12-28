import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../../pipes/truncate.pipe';

@Component({
  selector: 'materials-list',
  standalone: true,
  imports: [CommonModule, TruncatePipe],
  template: `
    <div *ngIf="materials.length > 0" class="materials-list">
      <div class="materials-header"><i class="fas fa-paperclip me-2"></i>Resources</div>
      <div class="list-group list-group-flush">
        <a *ngFor="let m of materials" [href]="m.url" target="_blank" class="material-item">
          <div class="icon-box">
            <i class="fas fa-file-alt"></i>
          </div>
          <span class="text-truncate">{{ m.name | truncate: 40 }}</span>
          <i class="fas fa-external-link-alt ms-auto link-icon"></i>
        </a>
      </div>
    </div>
  `,
  styleUrl: './materials-list.component.scss'
})
export class MaterialsListComponent {
  @Input() materials: { name: string; url: string }[] = [];
}
