import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonDirective, SpinnerComponent } from '@coreui/angular-pro';
import { MyProvider } from '@shared-services/provider';
import { RdlcViewerProps } from './rdlc-viewer.type';


@Component({
  selector: 'rdlcviewer, dss-rdlc-viewer',
  standalone: true,
  imports: [CommonModule, ButtonDirective, SpinnerComponent],
  templateUrl: './rdlc-viewer.component.html',
  styleUrl: './rdlc-viewer.component.scss',
})
export class RdlcViewerComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) reportProps: RdlcViewerProps = { url: '', params: [] };

  @Input() title = 'Report Preview';
  @Input() width = '100%';
  @Input() height = 'clamp(360px, 72vh, 900px)';
  @Input() minHeight = '360px';
  @Input() showToolbar = true;
  @Input() showClose = true;
  @Input() closeLabel = 'Close';

  @Output() closed = new EventEmitter<void>();

  loading = true;
  loadError = false;
  trustedUrl: SafeResourceUrl | null = null;
  reportUrl = '';

  private readonly sanitizer = inject(DomSanitizer);
  private readonly provider = inject(MyProvider);
  private readonly minimumLoadingTime = 350;
  private loadingStartedAt = 0;
  private loadingTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reportProps']) this.buildReportUrl();
  }

  onLoad(): void {
    const remainingTime = Math.max(
      0,
      this.minimumLoadingTime - (Date.now() - this.loadingStartedAt),
    );
    this.clearLoadingTimer();
    this.loadingTimer = setTimeout(() => {
      this.loading = false;
      this.loadError = false;
      this.loadingTimer = null;
    }, remainingTime);
  }

  onError(): void {
    this.loading = false;
    this.loadError = true;
  }

  close(): void {
    this.closed.emit();
  }

  ngOnDestroy(): void {
    this.clearLoadingTimer();
  }

  refresh(): void {
    this.buildReportUrl(true);
  }

  openInNewTab(): void {
    if (this.reportUrl) window.open(this.reportUrl, '_blank', 'noopener,noreferrer');
  }

  private buildReportUrl(cacheBust = false): void {
    if (!this.reportProps.url?.trim()) {
      this.trustedUrl = null;
      this.reportUrl = '';
      this.loading = false;
      return;
    }

    const base = this.provider.reportServer?.endsWith('/')
      ? this.provider.reportServer
      : `${this.provider.reportServer ?? ''}/`;
    const report = new URL(this.reportProps.url.replace(/^\//, ''), base);
    report.searchParams.set('currDate', this.formatCurrentDate(new Date()));

    for (const [key, value] of this.normalizedParams()) {
      if (value !== null && value !== undefined) report.searchParams.set(key, String(value));
    }

    if (cacheBust) report.searchParams.set('_refresh', Date.now().toString());

    this.loading = true;
    this.loadingStartedAt = Date.now();
    this.clearLoadingTimer();
    this.loadError = false;
    this.reportUrl = report.toString();
    this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.reportUrl);
  }

  private normalizedParams(): Array<[string, unknown]> {
    if (Array.isArray(this.reportProps.params)) {
      return this.reportProps.params
        .filter(param => Boolean(param?.key))
        .map(param => [param.key, param.value]);
    }
    return Object.entries(this.reportProps.params ?? {});
  }

  private formatCurrentDate(date: Date): string {
    const two = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())} ${two(date.getHours())}:${two(date.getMinutes())}:${two(date.getSeconds())}`;
  }
  private clearLoadingTimer(): void {
    if (this.loadingTimer !== null) {
      clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }
  }}



