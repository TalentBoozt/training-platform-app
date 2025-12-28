import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'video-preview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './video-preview.component.html',
    styleUrl: './video-preview.component.scss',
})
export class VideoPreviewComponent {
    @Input() src?: string;

    constructor(private sanitizer: DomSanitizer) { }

    // --- Type Checkers ---
    isDirectVideo(url?: string): boolean {
        return !!url && /\.(mp4|webm|ogg)(\?.*)?$/.test(url);
    }

    isYouTube(url?: string): boolean {
        return !!url && /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/.test(url);
    }

    isVimeo(url?: string): boolean {
        return !!url && /^(https?:\/\/)?(www\.)?vimeo\.com/.test(url);
    }

    isGoogleDrive(url?: string): boolean {
        return !!url && /drive\.google\.com/.test(url);
    }

    isDropbox(url?: string): boolean {
        return !!url && /dropbox\.com/.test(url);
    }

    isPlayable(url?: string): boolean {
        return (
            this.isDirectVideo(url) ||
            this.isYouTube(url) ||
            this.isVimeo(url) ||
            this.isGoogleDrive(url) ||
            this.isDropbox(url)
        );
    }

    // --- Embed URL Converters ---

    getYouTubeEmbedUrl(url: string): string {
        const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?#]+)/);
        const id = match ? match[1] : '';
        return `https://www.youtube.com/embed/${id}`;
    }

    getVimeoEmbedUrl(url: string): string {
        const match = url.match(/vimeo\.com\/(\d+)/);
        const id = match ? match[1] : '';
        return `https://player.vimeo.com/video/${id}`;
    }

    getGoogleDriveEmbedUrl(url: string): string {
        // Match: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//);
        const id = match ? match[1] : '';
        return `https://drive.google.com/file/d/${id}/preview`;
    }

    getDropboxEmbedUrl(url: string): string {
        // Convert ?dl=0 to ?raw=1
        return url.replace('?dl=0', '?raw=1').replace('?dl=1', '?raw=1');
    }

    // --- Safe Resource URL ---
    getSafeUrl(unsafeUrl: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
    }
}
