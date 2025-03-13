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
  NgZone
} from '@angular/core';
import {NgForOf} from '@angular/common';
import {WindowService} from '../../../../services/common/window.service';
import {TimerService} from '../../../../services/common/timer.service';

@Component({
  selector: 'app-rich-text-editor',
  imports: [
    NgForOf
  ],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
  standalone: true
})
export class RichTextEditorComponent implements AfterViewInit {
  @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;
  @Input() title: string = '';
  @Input() setContent: string = '';
  @Output() content = new EventEmitter<string>();

  // History management
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private maxHistorySize = 50;

  // Toolbar state
  activeStyles = {
    bold: false,
    italic: false,
    underline: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false
  };

  currentFontSize = '16px';
  currentColor = '#000000';
  currentFontFamily = 'Arial, sans-serif';

  // Track if content was modified
  contentModified = false;

  // Available font sizes
  fontSizes = [
    { value: '12px', label: '12' },
    { value: '14px', label: '14' },
    { value: '16px', label: '16' },
    { value: '18px', label: '18' },
    { value: '20px', label: '20' },
    { value: '24px', label: '24' },
    { value: '28px', label: '28' }
  ];

  // Available font families
  fontFamilies = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Tahoma, sans-serif', label: 'Tahoma' },
    { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
    { value: 'Impact, sans-serif', label: 'Impact' },
    { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' }
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private windowService: WindowService,
    private timerService: TimerService
  ) {}

  ngAfterViewInit() {
    // Use NgZone.runOutsideAngular to avoid triggering change detection
    this.ngZone.runOutsideAngular(() => {
      // Initialize editor with content if provided
      if (this.setContent && this.editor) {
        this.editor.nativeElement.innerHTML = this.setContent;

        // Queue up a save state operation after the current cycle completes
        this.timerService.setTimeout(() => {
          // Save initial state for undo
          this.saveState();
        }, 0);
      }

      // Add input listener for any content changes
      if (this.editor) {
        this.editor.nativeElement.addEventListener('input', () => {
          // Run inside Angular Zone to properly update bindings
          this.ngZone.run(() => {
            this.contentModified = true;
            this.cdr.detectChanges();
          });
        });
      }

      // Set initial focus to improve UX (delay to avoid issues)
      this.timerService.setTimeout(() => {
        if (this.editor) {
          this.editor.nativeElement.focus();
        }
      }, 100);
    });
  }

  // Track selection changes across the entire document
  @HostListener('document:selectionchange', ['$event'])
  onSelectionChange() {
    if (this.windowService.nativeWindow){
      this.ngZone.run(() => {
        const selection = window.getSelection();
        if (selection && this.isSelectionInEditor(selection)) {
          this.updateActiveStyles();
        }
      });
    }
  }

  // Check if the selection is within our editor
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

  // Save current state to undo stack
  saveState() {
    if (!this.editor) return;

    const currentHTML = this.editor.nativeElement.innerHTML;

    // Don't save if the content hasn't changed
    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === currentHTML) {
      return;
    }

    this.undoStack.push(currentHTML);

    // Limit stack size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }

    // Clear redo stack on new changes
    this.redoStack = [];

    // Update modified state
    this.contentModified = true;

    // Run change detection to update the UI
    this.cdr.detectChanges();
  }

  // Undo last action
  undo() {
    if (this.undoStack.length > 1 && this.editor) { // Keep at least one state in the stack
      // Save current state to redo stack
      this.redoStack.push(this.undoStack.pop()!);

      // Restore previous state
      this.editor.nativeElement.innerHTML = this.undoStack[this.undoStack.length - 1];

      // Update toolbar state
      this.updateActiveStyles();

      // Set modified flag
      this.contentModified = true;
      this.cdr.detectChanges();
    }
  }

  // Redo previously undone action
  redo() {
    if (this.redoStack.length > 0 && this.editor) {
      const state = this.redoStack.pop()!;
      this.undoStack.push(state);
      this.editor.nativeElement.innerHTML = state;

      // Update toolbar state
      this.updateActiveStyles();

      // Set modified flag
      this.contentModified = true;
      this.cdr.detectChanges();
    }
  }

  // Handle keyboard shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent) {
    if (this.windowService.nativeWindow){
      // Check if selection is in editor first
      const selection = window.getSelection();
      if (!selection || !this.isSelectionInEditor(selection)) return;
    }

    // Handle common shortcuts
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

  // Execute a document command with proper state saving
  executeCommand(command: string, value: string = '') {
    if (!this.editor) return;

    // Save current state before making changes
    this.saveState();

    // Focus the editor
    this.editor.nativeElement.focus();

    if (this.windowService.nativeDocument){
      // Execute the command
      document.execCommand(command, false, value);
    }

    // Update toolbar state to match new formatting
    this.updateActiveStyles();
  }

  // Apply text formatting style
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
    }
  }

  // Apply text alignment
  applyAlignment(alignment: string) {
    this.executeCommand('justifyLeft', '');
    this.executeCommand('justifyCenter', '');
    this.executeCommand('justifyRight', '');

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
    }
  }

  // Insert lists
  insertList(isOrdered: boolean) {
    this.executeCommand(isOrdered ? 'insertOrderedList' : 'insertUnorderedList');
  }

  // Apply font size
  applyFontSize(event: Event) {
    const size = (event.target as HTMLSelectElement).value;
    this.currentFontSize = size;
    this.executeCommand('fontSize', '7'); // Use placeholder size

    if (this.windowService.nativeWindow){
      // Apply actual CSS size to the fontsize elements
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !this.editor) return;
    }

    const elements = this.editor.nativeElement.querySelectorAll('font[size="7"]');
    elements.forEach(el => {
      el.removeAttribute('size');
      (el as HTMLElement).style.fontSize = size;
    });
  }

  // Apply font family
  applyFontFamily(event: Event) {
    const fontFamily = (event.target as HTMLSelectElement).value;
    this.currentFontFamily = fontFamily;
    this.executeCommand('fontName', fontFamily);
  }

  // Apply text color
  applyColor(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    this.currentColor = color;
    this.executeCommand('foreColor', color);
  }

  // Insert link
  insertLink() {
    if (!this.editor) return;

    if (this.windowService.nativeWindow){
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const url = prompt("Enter URL:", "https://");
      if (!url) return;

      this.executeCommand('createLink', url);

      // Set target attribute for new links
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

  // Update toolbar state based on current selection
  updateActiveStyles() {
    if (this.windowService.nativeWindow && this.windowService.nativeDocument){
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      // Reset state
      this.activeStyles = {
        bold: false,
        italic: false,
        underline: false,
        alignLeft: false,
        alignCenter: false,
        alignRight: false
      };

      // Check for document.queryCommandState
      this.activeStyles.bold = document.queryCommandState('bold');
      this.activeStyles.italic = document.queryCommandState('italic');
      this.activeStyles.underline = document.queryCommandState('underline');
      this.activeStyles.alignLeft = document.queryCommandState('justifyLeft');
      this.activeStyles.alignCenter = document.queryCommandState('justifyCenter');
      this.activeStyles.alignRight = document.queryCommandState('justifyRight');

      // Detect font size and color from current selection
      const node = selection.anchorNode?.parentElement;
      if (node) {
        this.detectFontStyles(node);
      }
    }

    // Run change detection to update UI
    this.cdr.detectChanges();
  }

  // Extract font styles from current node or parent nodes
  private detectFontStyles(node: Element) {
    if (this.windowService.nativeWindow){
      const computedStyle = window.getComputedStyle(node);

      // Check for font size
      if (computedStyle.fontSize) {
        // Find nearest match in our available sizes
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

      // Check for font family
      if (computedStyle.fontFamily) {
        const fontFamily = computedStyle.fontFamily;

        // Find matching font family or use default
        const matchedFont = this.fontFamilies.find(font =>
          fontFamily.includes(font.label) ||
          fontFamily.includes(font.value.split(',')[0])
        );

        if (matchedFont) {
          this.currentFontFamily = matchedFont.value;
        }
      }

      // Check for color
      if (computedStyle.color) {
        const rgb = computedStyle.color;
        if (rgb.startsWith('rgb')) {
          const rgbValues = rgb.match(/\d+/g);
          if (rgbValues && rgbValues.length >= 3) {
            const r = parseInt(rgbValues[0]);
            const g = parseInt(rgbValues[1]);
            const b = parseInt(rgbValues[2]);

            // Convert RGB to hex
            this.currentColor = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
          }
        }
      }
    }
  }

  // Check if style is active
  isActive(style: string): boolean {
    return this.activeStyles[style as keyof typeof this.activeStyles];
  }

  // Save content and emit it
  saveContent() {
    if (!this.editor) return;

    const content = this.editor.nativeElement.innerHTML;
    this.content.emit(content);
    this.contentModified = false;
    this.cdr.detectChanges();
  }

  // Add a tooltip utility
  showTooltip(event: MouseEvent, message: string) {
    if (this.windowService.nativeDocument){
      const tooltip = document.createElement('div');
      tooltip.classList.add('rte-tooltip');
      tooltip.textContent = message;
      // Position tooltip near the mouse
      tooltip.style.position = 'absolute';
      tooltip.style.left = `${event.clientX + 10}px`;
      tooltip.style.top = `${event.clientY + 10}px`;
      // Add to document
      document.body.appendChild(tooltip);
    }
  }

  hideTooltip() {
    if (this.windowService.nativeDocument){
      const tooltip = document.querySelector('.rte-tooltip');
      if (tooltip) {
        document.body.removeChild(tooltip);
      }
    }
  }
}
