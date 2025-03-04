import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-rich-text-editor',
  imports: [],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
  standalone: true
})
export class RichTextEditorComponent {
  @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;
  private undoStack: string[] = [];
  private redoStack: string[] = [];

  activeStyles = {
    bold: false,
    italic: false,
    underline: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false
  };

  saveState() {
    this.undoStack.push(this.editor.nativeElement.innerHTML);
    this.redoStack = [];
  }

  undo() {
    if (this.undoStack.length > 0) {
      this.redoStack.push(this.editor.nativeElement.innerHTML);
      this.editor.nativeElement.innerHTML = this.undoStack.pop()!;
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      this.undoStack.push(this.editor.nativeElement.innerHTML);
      this.editor.nativeElement.innerHTML = this.redoStack.pop()!;
    }
  }

  applyStyle(style: string) {
    this.saveState();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');

    switch (style) {
      case 'bold':
        span.style.fontWeight = this.activeStyles.bold ? 'normal' : 'bold';
        break;
      case 'italic':
        span.style.fontStyle = this.activeStyles.italic ? 'normal' : 'italic';
        break;
      case 'underline':
        span.style.textDecoration = this.activeStyles.underline ? 'none' : 'underline';
        break;
    }

    span.appendChild(range.extractContents());
    range.insertNode(span);

    this.updateActiveStyles();
  }

  applyAlignment(alignment: string) {
    this.saveState();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const div = document.createElement('div');

    div.style.textAlign = alignment;
    div.appendChild(range.extractContents());

    range.insertNode(div);
    this.updateActiveStyles();
  }

  insertList(isOrdered: boolean) {
    this.saveState();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const list = document.createElement(isOrdered ? 'ol' : 'ul');
    const listItem = document.createElement('li');

    listItem.textContent = selection.toString() || 'New Item';
    list.appendChild(listItem);

    range.deleteContents();
    range.insertNode(list);
  }

  applyFontSize(event: Event) {
    const size = (event.target as HTMLSelectElement).value;
    this.saveState();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');

    span.style.fontSize = size;
    span.appendChild(range.extractContents());

    range.insertNode(span);
  }

  applyColor(event: Event) {
    const color = (event.target as HTMLInputElement).value;
    this.saveState();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');

    span.style.color = color;
    span.appendChild(range.extractContents());

    range.insertNode(span);
  }

  insertLink() {
    this.saveState();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const url = prompt("Enter URL:");
    if (!url) return;

    const range = selection.getRangeAt(0);
    const link = document.createElement('a');

    link.href = url;
    link.target = "_blank";
    link.appendChild(range.extractContents());

    range.insertNode(link);
  }

  updateActiveStyles() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const parent = selection.anchorNode?.parentElement;
    if (!parent) return;

    this.activeStyles.bold = parent.style.fontWeight === 'bold';
    this.activeStyles.italic = parent.style.fontStyle === 'italic';
    this.activeStyles.underline = parent.style.textDecoration === 'underline';
    this.activeStyles.alignLeft = parent.style.textAlign === 'left';
    this.activeStyles.alignCenter = parent.style.textAlign === 'center';
    this.activeStyles.alignRight = parent.style.textAlign === 'right';
  }

  isActive(style: string): boolean {
    return this.activeStyles[style as keyof typeof this.activeStyles];
  }
}
