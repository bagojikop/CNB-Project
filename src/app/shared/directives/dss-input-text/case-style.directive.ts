import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { CaseStyle } from './case-style-enum';

@Directive({
  selector: '[caseStyle]',
  standalone: true,
})
export class CaseStyleDirective {
  @Input('caseStyle') caseStyle: CaseStyle | string | boolean | null | undefined;

  constructor(private elementRef: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    if (!this.caseStyle) return;

    const input = this.elementRef.nativeElement;
    const currentValue = input.value;
    const nextValue = this.transform(currentValue);

    if (nextValue === currentValue) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    input.value = nextValue;
    input.setSelectionRange(start, end);
  }

  private transform(value: string): string {
    const style = this.caseStyle;

    switch (style) {
      
      case CaseStyle.LOWERCASE:
        return value.toLowerCase();
      case CaseStyle.TITLECASE:
        let lowerValue = value.toLowerCase();
        return lowerValue.replace(/\b\w/g, (char) => char.toUpperCase());
      case CaseStyle.UPPERCASE:
        return value.toUpperCase();
      default:
        return value;
    }
  }
}
