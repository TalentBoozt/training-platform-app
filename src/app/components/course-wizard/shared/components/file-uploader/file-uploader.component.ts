import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'file-uploader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './file-uploader.component.html',
    styleUrl: './file-uploader.component.scss',
})
export class FileUploaderComponent {
    @Input() label = 'Choose file';
    @Input() icon = 'fas fa-upload';
    @Output() fileSelected = new EventEmitter<File>();
    onFile(files: FileList | null) {
        if (!files?.length) return;
        this.fileSelected.emit(files[0]);
    }
}
