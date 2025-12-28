import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsListComponent } from '../materials-list/materials-list.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SecondsToTimePipe } from './seconds-to-time.pipe';

@Component({
    selector: 'lecture-card',
    standalone: true,
    imports: [CommonModule, MaterialsListComponent, SecondsToTimePipe],
    templateUrl: './lecture-card.component.html',
    styleUrl: './lecture-card.component.scss'
})
export class LectureCardComponent {
    @Input() lecture!: {
        title?: string;
        description?: string;
        notes?: string;
        duration?: number;
        videoUrl?: string;
        materials?: any[];
        freePreview?: boolean;
    };

    constructor(private sanitizer: DomSanitizer) { }

    sanitizeHTML(html: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
