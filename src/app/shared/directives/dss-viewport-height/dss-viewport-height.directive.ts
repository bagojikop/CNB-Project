import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[dssViewportHeight]',
  standalone: true,
})
export class DssViewportHeightDirective {
  @HostBinding('style.height') height = 'calc(100vh - 175px)';
  @HostBinding('style.min-height') minHeight = 'calc(100vh - 175px)';
  private offset = '175px';

  @Input()
  set dssViewportHeight(offset: string | number | null | undefined) {
    this.offset = this.normalizeOffset(offset);
    this.updateHeight();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateHeight();
  }

  private normalizeOffset(offset: string | number | null | undefined): string {
    if (offset === null || offset === undefined || offset === '') {
      return '175px';
    }

    return typeof offset === 'number' ? `${offset}px` : offset;
  }

  private updateHeight(): void {
    const isMobileOrTablet =
      typeof window !== 'undefined' && window.innerWidth < 992;

    const responsiveHeight = isMobileOrTablet
      ? 'auto'
      : `calc(100vh - ${this.offset})`;

    this.height = responsiveHeight;
    this.minHeight = responsiveHeight;
  }
}
