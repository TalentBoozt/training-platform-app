import {
    Component,
    AfterViewInit,
    ViewChild,
    ElementRef,
    Input,
    Output,
    EventEmitter,
    HostListener,
    ChangeDetectorRef,
    NgZone,
    OnInit
} from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { WindowService } from '../../../course-wizard/core/services/common/window.service';
import { TimerService } from '../../../course-wizard/core/services/common/timer.service';
import { ThemeService } from '../../../course-wizard/core/services/common/theme.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-rich-text-editor',
    imports: [
        NgForOf,
        NgClass,
        NgIf,
        FormsModule
    ],
    templateUrl: './rich-text-editor.component.html',
    styleUrl: './rich-text-editor.component.scss',
    standalone: true
})
export class RichTextEditorComponent implements AfterViewInit, OnInit {
    @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;
    @Input() title: string = '';
    @Input() setContent: string = '';
    @Output() content = new EventEmitter<string>();

    // History management
    undoStack: string[] = [];
    redoStack: string[] = [];
    private maxHistorySize = 50;

    // Toolbar state
    activeStyles = {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        subscript: false,
        superscript: false,
        alignLeft: false,
        alignCenter: false,
        alignRight: false,
        alignJustify: false
    };

    currentFontSize = '16px';
    currentColor = '#6366f1'; // Primary color
    currentHighlight = 'transparent';
    currentFontFamily = 'Arial, sans-serif';
    currentHeading = 'p';

    // Track if content was modified
    contentModified = false;

    // Word and character count
    wordCount = 0;
    charCount = 0;

    // Available headings
    headings = [
        { value: 'p', label: 'Paragraph' },
        { value: 'h1', label: 'Heading 1' },
        { value: 'h2', label: 'Heading 2' },
        { value: 'h3', label: 'Heading 3' },
        { value: 'h4', label: 'Heading 4' },
        { value: 'h5', label: 'Heading 5' },
        { value: 'h6', label: 'Heading 6' }
    ];

    // Available font sizes
    fontSizes = [
        { value: '12px', label: '12' },
        { value: '14px', label: '14' },
        { value: '16px', label: '16' },
        { value: '18px', label: '18' },
        { value: '20px', label: '20' },
        { value: '24px', label: '24' },
        { value: '28px', label: '28' },
        { value: '32px', label: '32' },
        { value: '36px', label: '36' }
    ];

    // Available font families
    fontFamilies = [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: '"Times New Roman", serif', label: 'Times New Roman' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: '"Courier New", monospace', label: 'Courier New' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
        { value: 'Tahoma, sans-serif', label: 'Tahoma' },
        { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet' },
        { value: '"Segoe UI", sans-serif', label: 'Segoe UI' },
        { value: 'Poppins, sans-serif', label: 'Poppins' },
        { value: 'Inter, sans-serif', label: 'Inter' }
    ];

    // Color palette (excluding pure black and white)
    colorPalette = [
        '#6366f1', // Primary (Indigo)
        '#8b5cf6', // Purple
        '#ec4899', // Pink
        '#f43f5e', // Rose
        '#ef4444', // Red
        '#f97316', // Orange
        '#f59e0b', // Amber
        '#eab308', // Yellow
        '#84cc16', // Lime
        '#22c55e', // Green
        '#10b981', // Emerald
        '#14b8a6', // Teal
        '#06b6d4', // Cyan
        '#0ea5e9', // Sky
        '#3b82f6', // Blue
        '#6366f1', // Indigo
        '#8b5cf6', // Violet
        '#a855f7', // Purple
        '#d946ef', // Fuchsia
        '#64748b', // Slate
        '#71717a', // Zinc
        '#78716c'  // Stone
    ];

    // Highlight palette (semi-transparent colors)
    highlightPalette = [
        'transparent',
        'rgba(99, 102, 241, 0.2)',  // Indigo
        'rgba(139, 92, 246, 0.2)',  // Purple
        'rgba(236, 72, 153, 0.2)',  // Pink
        'rgba(239, 68, 68, 0.2)',   // Red
        'rgba(249, 115, 22, 0.2)',  // Orange
        'rgba(245, 158, 11, 0.2)',  // Amber
        'rgba(234, 179, 8, 0.2)',   // Yellow
        'rgba(132, 204, 22, 0.2)',  // Lime
        'rgba(34, 197, 94, 0.2)',   // Green
        'rgba(20, 184, 166, 0.2)',  // Teal
        'rgba(6, 182, 212, 0.2)'    // Cyan
    ];

    constructor(
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone,
        private windowService: WindowService,
        private timerService: TimerService,
        public themeService: ThemeService
    ) { }

    ngOnInit() {
        // Theme is handled by ThemeService
    }

    ngAfterViewInit() {
        this.ngZone.runOutsideAngular(() => {
            if (this.setContent && this.editor) {
                this.editor.nativeElement.innerHTML = this.setContent;
                this.timerService.setTimeout(() => {
                    this.saveState();
                    this.updateStats();
                }, 0);
            }

            if (this.editor) {
                this.editor.nativeElement.addEventListener('input', () => {
                    this.ngZone.run(() => {
                        this.contentModified = true;
                        this.updateStats();
                        this.cdr.detectChanges();
                    });
                });
            }

            this.timerService.setTimeout(() => {
                if (this.editor) {
                    this.editor.nativeElement.focus();
                }
            }, 100);
        });
    }

    // Update word and character count
    updateStats() {
        if (!this.editor) return;

        const text = this.editor.nativeElement.innerText || '';
        this.charCount = text.length;
        this.wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    @HostListener('document:selectionchange')
    onSelectionChange() {
        if (this.windowService.nativeWindow) {
            this.ngZone.run(() => {
                const selection = window.getSelection();
                if (selection && this.isSelectionInEditor(selection)) {
                    this.updateActiveStyles();
                }
            });
        }
    }

    private isSelectionInEditor(selection: Selection): boolean {
        if (!selection.rangeCount || !this.editor) return false;

        let node = selection.anchorNode;
        while (node !== null) {
            if (node === this.editor.nativeElement) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }

    saveState() {
        if (!this.editor) return;

        const currentHTML = this.editor.nativeElement.innerHTML;

        if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === currentHTML) {
            return;
        }

        this.undoStack.push(currentHTML);

        if (this.undoStack.length > this.maxHistorySize) {
            this.undoStack.shift();
        }

        this.redoStack = [];
        this.contentModified = true;
        this.cdr.detectChanges();
    }

    undo() {
        if (this.undoStack.length > 1 && this.editor) {
            this.redoStack.push(this.undoStack.pop()!);
            this.editor.nativeElement.innerHTML = this.undoStack[this.undoStack.length - 1];
            this.updateActiveStyles();
            this.updateStats();
            this.contentModified = true;
            this.cdr.detectChanges();
        }
    }

    redo() {
        if (this.redoStack.length > 0 && this.editor) {
            const state = this.redoStack.pop()!;
            this.undoStack.push(state);
            this.editor.nativeElement.innerHTML = state;
            this.updateActiveStyles();
            this.updateStats();
            this.contentModified = true;
            this.cdr.detectChanges();
        }
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardShortcut(event: KeyboardEvent) {
        if (this.windowService.nativeWindow) {
            const selection = window.getSelection();
            if (!selection || !this.isSelectionInEditor(selection)) return;
        }

        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'b':
                    event.preventDefault();
                    this.applyStyle('bold');
                    break;
                case 'i':
                    event.preventDefault();
                    this.applyStyle('italic');
                    break;
                case 'u':
                    event.preventDefault();
                    this.applyStyle('underline');
                    break;
                case 'z':
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'y':
                    event.preventDefault();
                    this.redo();
                    break;
            }
        }
    }

    executeCommand(command: string, value: string = '') {
        if (!this.editor) return;

        this.saveState();
        this.editor.nativeElement.focus();

        if (this.windowService.nativeDocument) {
            document.execCommand(command, false, value);
        }

        this.updateActiveStyles();
    }

    applyStyle(style: string) {
        switch (style) {
            case 'bold':
                this.executeCommand('bold');
                break;
            case 'italic':
                this.executeCommand('italic');
                break;
            case 'underline':
                this.executeCommand('underline');
                break;
            case 'strikethrough':
                this.executeCommand('strikeThrough');
                break;
            case 'subscript':
                this.executeCommand('subscript');
                break;
            case 'superscript':
                this.executeCommand('superscript');
                break;
        }
    }

    applyAlignment(alignment: string) {
        switch (alignment) {
            case 'left':
                this.executeCommand('justifyLeft');
                break;
            case 'center':
                this.executeCommand('justifyCenter');
                break;
            case 'right':
                this.executeCommand('justifyRight');
                break;
            case 'justify':
                this.executeCommand('justifyFull');
                break;
        }
    }

    applyHeading(event: Event) {
        const heading = (event.target as HTMLSelectElement).value;
        this.currentHeading = heading;
        this.executeCommand('formatBlock', heading);
    }

    insertList(isOrdered: boolean) {
        this.executeCommand(isOrdered ? 'insertOrderedList' : 'insertUnorderedList');
    }

    applyFontSize(event: Event) {
        const size = (event.target as HTMLSelectElement).value;
        this.currentFontSize = size;
        this.executeCommand('fontSize', '7');

        if (this.editor) {
            const elements = this.editor.nativeElement.querySelectorAll('font[size="7"]');
            elements.forEach(el => {
                el.removeAttribute('size');
                (el as HTMLElement).style.fontSize = size;
            });
        }
    }

    applyFontFamily(event: Event) {
        const fontFamily = (event.target as HTMLSelectElement).value;
        this.currentFontFamily = fontFamily;
        this.executeCommand('fontName', fontFamily);
    }

    applyColorFromPalette(color: string) {
        this.currentColor = color;
        this.executeCommand('foreColor', color);
    }

    applyHighlight(color: string) {
        this.currentHighlight = color;
        this.executeCommand('backColor', color);
    }

    insertLink() {
        if (!this.editor) return;

        if (this.windowService.nativeWindow) {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const url = prompt("Enter URL:", "https://");
            if (!url) return;

            this.executeCommand('createLink', url);

            const range = selection.getRangeAt(0);
            const links = this.editor.nativeElement.querySelectorAll('a');

            links.forEach(link => {
                if (range.intersectsNode(link)) {
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                }
            });
        }
    }

    insertCode() {
        this.saveState();
        if (this.windowService.nativeDocument) {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const code = document.createElement('code');
            code.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
            code.style.padding = '2px 6px';
            code.style.borderRadius = '4px';
            code.style.fontFamily = 'monospace';

            try {
                range.surroundContents(code);
            } catch (e) {
                code.textContent = range.toString();
                range.deleteContents();
                range.insertNode(code);
            }
        }
    }

    insertBlockquote() {
        this.executeCommand('formatBlock', 'blockquote');
    }

    removeFormat() {
        this.executeCommand('removeFormat');
    }

    updateActiveStyles() {
        if (this.windowService.nativeWindow && this.windowService.nativeDocument) {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            this.activeStyles = {
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
                strikethrough: document.queryCommandState('strikeThrough'),
                subscript: document.queryCommandState('subscript'),
                superscript: document.queryCommandState('superscript'),
                alignLeft: document.queryCommandState('justifyLeft'),
                alignCenter: document.queryCommandState('justifyCenter'),
                alignRight: document.queryCommandState('justifyRight'),
                alignJustify: document.queryCommandState('justifyFull')
            };

            const node = selection.anchorNode?.parentElement;
            if (node) {
                this.detectFontStyles(node);
            }
        }

        this.cdr.detectChanges();
    }

    private detectFontStyles(node: Element) {
        if (this.windowService.nativeWindow) {
            const computedStyle = window.getComputedStyle(node);

            if (computedStyle.fontSize) {
                const sizePx = parseFloat(computedStyle.fontSize);
                let closestSize = this.fontSizes[0].value;
                let minDiff = Math.abs(parseFloat(closestSize) - sizePx);

                this.fontSizes.forEach(size => {
                    const diff = Math.abs(parseFloat(size.value) - sizePx);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestSize = size.value;
                    }
                });

                this.currentFontSize = closestSize;
            }

            if (computedStyle.fontFamily) {
                const fontFamily = computedStyle.fontFamily;
                const matchedFont = this.fontFamilies.find(font =>
                    fontFamily.includes(font.label) ||
                    fontFamily.includes(font.value.split(',')[0].replace(/"/g, ''))
                );

                if (matchedFont) {
                    this.currentFontFamily = matchedFont.value;
                }
            }

            // Detect heading
            const tagName = node.tagName.toLowerCase();
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(tagName)) {
                this.currentHeading = tagName;
            }
        }
    }

    isActive(style: string): boolean {
        return this.activeStyles[style as keyof typeof this.activeStyles];
    }

    saveContent() {
        if (!this.editor) return;

        const content = this.editor.nativeElement.innerHTML;
        this.content.emit(content);
        this.contentModified = false;
        this.cdr.detectChanges();
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }
}
