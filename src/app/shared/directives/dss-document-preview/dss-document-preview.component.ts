import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModalModule } from '@coreui/angular-pro';

export type DssDocumentPreviewKind = 'image' | 'pdf';

@Component({
  selector: 'dss-document-preview',
  standalone: true,
  imports: [ModalModule],
  templateUrl: './dss-document-preview.component.html',
})
export class DssDocumentPreviewComponent {
  @Input() title = 'Document Preview';
  @Input() uploadLabel = 'Capture / Upload';
  @Input() saveLabel = 'Add';
  @Input() showSave = true;
  @Input() saveDisabled = false;
  @Input() accept = 'image/*,.pdf';
  @Input() capture: string | null = 'environment';
  @Input() previewHeight = '500px';
  @Input() previewMaxHeight = '60vh';
  @Input() emptyMessage = 'Please select the file or open your camera and click image.';

  @Output() fileChange = new EventEmitter<File | null>();
  @Output() save = new EventEmitter<File>();
  @Output() closed = new EventEmitter<void>();

  visible = false;
  file: File | null = null;
  previewUrl: string | null = null;
  previewResourceUrl: SafeResourceUrl | null = null;
  previewKind: DssDocumentPreviewKind | null = null;
  previewLoading = false;
  previewFileName: string | null = null;

  private objectPreviewUrl: string | null = null;
  private readonly sanitizer = inject(DomSanitizer);

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
    this.clear();
    this.closed.emit();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    this.setFile(input.files[0]);
    input.value = '';
  }

  setFile(file: File): void {
    this.clear();
    this.file = file;
    this.previewFileName = file.name;
    this.fileChange.emit(file);

    if (file.type.startsWith('image/')) {
      this.previewKind = 'image';
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
      return;
    }

    if (file.type === 'application/pdf') {
      this.setBlobPreview(file, file.name);
    }
  }

  showBlob(fileStream: ArrayBuffer, fileName: string | null | undefined): void {
    this.clear();
    this.visible = true;
    this.setBlobPreview(fileStream, fileName);
  }

  showLoading(): void {
    this.clear();
    this.visible = true;
    this.previewLoading = true;
  }

  stopLoading(): void {
    this.previewLoading = false;
  }

  openPreview(): void {
    if (!this.previewUrl) return;

    window.open(this.previewUrl, '_blank', 'noopener,noreferrer');
  }

  downloadPreview(): void {
    if (!this.previewUrl) return;

    const link = document.createElement('a');
    link.href = this.previewUrl;
    link.download = this.previewFileName || 'document';
    link.click();
  }

  emitSave(): void {
    if (!this.file) return;

    this.save.emit(this.file);
  }

  clear(): void {
    if (this.objectPreviewUrl) {
      URL.revokeObjectURL(this.objectPreviewUrl);
    }

    this.file = null;
    this.previewUrl = null;
    this.previewResourceUrl = null;
    this.previewKind = null;
    this.previewLoading = false;
    this.previewFileName = null;
    this.objectPreviewUrl = null;
    this.fileChange.emit(null);
  }

  private setBlobPreview(fileOrStream: BlobPart, fileName: string | null | undefined): void {
    const mimeType = fileOrStream instanceof File && fileOrStream.type
      ? fileOrStream.type
      : this.getDocumentMimeType(fileName);
    const blob = fileOrStream instanceof Blob && fileOrStream.type === mimeType
      ? fileOrStream
      : new Blob([fileOrStream], { type: mimeType });

    this.previewFileName = fileName ?? 'document';
    this.objectPreviewUrl = URL.createObjectURL(blob);
    this.previewUrl = this.objectPreviewUrl;
    this.previewLoading = false;

    if (mimeType === 'application/pdf') {
      this.previewKind = 'pdf';
      this.previewResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectPreviewUrl);
      return;
    }

    this.previewKind = 'image';
    this.previewResourceUrl = null;
  }

  private getDocumentMimeType(fileName: string | null | undefined): string {
    const extension = fileName?.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}
