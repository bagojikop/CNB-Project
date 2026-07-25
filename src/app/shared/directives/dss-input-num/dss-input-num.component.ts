import { CommonModule } from '@angular/common';
import {
  Component,
  booleanAttribute,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { FormModule, TooltipModule } from '@coreui/angular-pro';
import { DssLocaleService } from '@shared-services/common';

@Component({
  selector: 'dss-input-num',
  standalone: true,
  imports: [CommonModule, FormsModule, FormModule, TooltipModule],
  host: {
    '[style.display]': 'controlWidth() ? "block" : null',
    '[style.width]': 'normalizedControlWidth()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DssInputNumComponent),
      multi: true,
    },
  ],
  template: `
    <div class="cFormGroup mb-2">
      @if (label()) {
        <label
          [for]="id()"
          class="dss-input-label"
          [style.text-align]="labelAlign()"
          [style.--dss-label-bg]="labelBg() ?? 'transparent'"
          [style.--dss-label-dark-bg]="
            labelDarkBg() ?? labelBg() ?? 'transparent'
          "
          [style.--dss-label-color]="labelColor() ?? 'inherit'"
          [style.--dss-label-dark-color]="
            labelDarkColor() ?? labelColor() ?? 'inherit'
          "
          [style.padding]="labelBg() || labelDarkBg() ? '0 0.25rem' : '0'"
        >
          {{ label() }}
          @if (showRequiredMark(name.invalid)) {
            <span
              class="dss-validation-error"
              role="button"
              tabindex="0"
              [cTooltip]="validationMessage(name.invalid)"
              cTooltipPlacement="top"
              [cTooltipTrigger]="[]"
              [cTooltipVisible]="validationTooltipVisible()"
              (click)="toggleValidationTooltip($event)"
              (keydown.enter)="toggleValidationTooltip($event)"
              (keydown.space)="toggleValidationTooltip($event)"
              (blur)="hideValidationTooltip()"
            ></span>
          }
        </label>
      }
      <input
        cFormControl
        #name="ngModel"
        type="text"
        class="text-end"
        [sizing]="sizing()"
        [class.form-control-sm]="sizing() === 'sm'"
        [class.form-control-md]="sizing() === 'md'"
        [class.form-control-lg]="sizing() === 'lg'"
        [id]="id()"
        [placeholder]="placeholder()"
        [ngModel]="displayValue()"
        [required]="required()"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [pattern]="pattern()"
        [readonly]="readonly()"
        [disabled]="isDisabled()"
        [ngModelOptions]="{ standalone: true }"
        (keypress)="onKeyPress($event)"
        (paste)="onPaste($event)"
        (focus)="unformatValue()"
        (blur)="onBlur()"
        (ngModelChange)="onValueChange($event)"
      />
    </div>
  `,
  styles: [
    `
      .dss-input-label {
        display: block;
        background-color: var(--dss-label-bg);
        color: var(--dss-label-color);
      }

      :host-context([data-coreui-theme='dark']) .dss-input-label,
      :host-context([data-bs-theme='dark']) .dss-input-label,
      :host-context(.dark) .dss-input-label {
        background-color: var(--dss-label-dark-bg);
        color: var(--dss-label-dark-color);
      }
    `,
  ],
})
export class DssInputNumComponent {
  private readonly localeService = inject(DssLocaleService);

  id = input('');
  label = input('');
  placeholder = input('');
  labelAlign = input<'left' | 'center' | 'right'>('left');
  labelBg = input<string | null>(null);
  labelDarkBg = input<string | null>(null);
  labelColor = input<string | null>(null);
  labelDarkColor = input<string | null>(null);
  step = input<string | null>(null);
  required = input(false, { transform: booleanAttribute });
  readonly = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  allowNegative = input(false, { transform: booleanAttribute });
  isneg = input(false, { transform: booleanAttribute });
  currency = input(false, { transform: booleanAttribute });
  min = input<string | number | null>(null);
  max = input<string | number | null>(null);
  fraction = input<string | number>(0);
  locale = input<string | null>(null);
  currencyCode = input<string | null>(null);
  currencyDisplay = input<'code' | 'symbol' | 'narrowSymbol' | 'name'>(
    'symbol',
  );
  sizing = input<'sm' | 'md' | 'lg'>('sm');
  controlWidth = input<string | number | null>(null, { alias: 'width' });

  value = model<number | null>();
  displayValue = model<string>('');
  private formDisabled = signal(false);
  validationTooltipVisible = signal(false);
  private onChange: (value: number | null) => void = () => { };
  private onTouchedCallback: () => void = () => { };

  writeValue(value: number | string | null): void {
    const parsedValue =
      value === null || value === undefined || value === ''
        ? null
        : Number(value);

    this.value.set(Number.isNaN(parsedValue) ? null : parsedValue);
    this.formatValue();
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  onValueChange(value: string | null): void {
    if (value === null || value === undefined || value === '') {
      this.value.set(null);
      this.displayValue.set('');
      this.onChange(null);
      return;
    }

    const sanitized = this.sanitizeNumberText(value);
    const parsedValue = Number(sanitized);
    const nextValue = Number.isNaN(parsedValue) ? null : parsedValue;

    this.displayValue.set(sanitized);
    this.value.set(nextValue);
    this.onChange(nextValue);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const key = event.key;
    const currentValue = (event.target as HTMLInputElement).value;

    if (/^\d$/.test(key)) return;
    if (
      key === '.' &&
      Number(this.fraction()) > 0 &&
      !currentValue.includes('.')
    )
      return;
    if (key === '-' && this.canUseNegative() && !currentValue.includes('-'))
      return;

    event.preventDefault();
  }

  onPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text') ?? '';

    if (this.sanitizeNumberText(text) !== text.trim()) {
      event.preventDefault();
    }
  }

  formatValue(): void {
    const value = this.value();

    if (value === null || value === undefined) {
      this.displayValue.set('');
      return;
    }

    this.displayValue.set(this.formatNumber(value));
  }

  onBlur(): void {
    this.formatValue();
    this.onTouchedCallback();
  }

  isDisabled(): boolean {
    return this.disabled() || this.formDisabled();
  }

  toggleValidationTooltip(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.validationTooltipVisible.update((visible) => !visible);
  }

  hideValidationTooltip(): void {
    this.validationTooltipVisible.set(false);
  }

  unformatValue(): void {
    const value = this.value();

    this.displayValue.set(
      value === null || value === undefined ? '' : String(value),
    );
  }

  showRequiredMark(invalid: boolean | null | undefined = false): boolean {
    const value = this.value();
    const isEmpty = value === null || value === undefined;

    return this.required() && (!!invalid || isEmpty);
  }

  validationMessage(invalid: boolean | null | undefined = false): string {
    const value = this.value();
    const isEmpty = value === null || value === undefined;

    if (this.required() && isEmpty) return `${this.label()} is required.`;
    if (invalid) return `Enter a valid ${this.label().toLowerCase()}.`;

    return `${this.label()} is required.`;
  }

  pattern(): string {
    const sign = this.canUseNegative() ? '-?' : '';
    const wholeNumber = this.currency() ? '[\\d,]*' : '\\d*';
    const decimal =
      Number(this.fraction()) > 0 ? `(\\.\\d{0,${this.fraction()}})?` : '';
    const currencyText = this.currencyCode() ? '[^0-9.-]*' : '';

    return `^${sign}${currencyText}${wholeNumber}${decimal}${currencyText}$`;
  }

  normalizedControlWidth(): string | null {
    const width = this.controlWidth();

    if (width === null || width === undefined || width === '') return null;

    const normalizedWidth = typeof width === 'number' ? `${width}px` : width;

    return `min(100%, ${normalizedWidth})`;
  }

  private formatNumber(value: number): string {
    if (!this.currency()) return value.toFixed(Number(this.fraction()));

    if (this.currencyCode()) {
      return new Intl.NumberFormat(this.currentLocale(), {
        style: 'currency',
        currency: this.currencyCode() ?? undefined,
        currencyDisplay: this.currencyDisplay(),
        minimumFractionDigits: Number(this.fraction()),
        maximumFractionDigits: Number(this.fraction()),
      }).format(value);
    }

    return new Intl.NumberFormat(this.currentLocale(), {
      minimumFractionDigits: Number(this.fraction()),
      maximumFractionDigits: Number(this.fraction()),
    }).format(value);
  }

  private sanitizeNumberText(value: string): string {
    let nextValue = value.trim().replace(/[^0-9.-]/g, '');

    if (!this.canUseNegative()) {
      nextValue = nextValue.replace(/-/g, '');
    } else {
      nextValue = nextValue.replace(/(?!^)-/g, '');
    }

    if (Number(this.fraction()) === 0) {
      nextValue = nextValue.replace(/\./g, '');
    } else {
      const firstDecimalIndex = nextValue.indexOf('.');
      if (firstDecimalIndex >= 0) {
        const beforeDecimal = nextValue.slice(0, firstDecimalIndex + 1);
        const afterDecimal = nextValue
          .slice(firstDecimalIndex + 1)
          .replace(/\./g, '')
          .slice(0, Number(this.fraction()));

        nextValue = `${beforeDecimal}${afterDecimal}`;
      }
    }

    return nextValue;
  }

  private canUseNegative(): boolean {
    return this.allowNegative() || this.isneg();
  }

  private currentLocale(): string {
    return this.locale() ?? this.localeService.locale();
  }
}
