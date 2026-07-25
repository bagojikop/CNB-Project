import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  booleanAttribute,
  computed,
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
import { DatePickerModule, TooltipModule } from '@coreui/angular-pro';
import { DssDateFinService } from '@shared-services/dss-date-fin.service';
import { DssLocaleService } from '@shared-services/common';

@Component({
  selector: 'dss-date-fin',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule, TooltipModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DssDateFinComponent),
      multi: true,
    },
  ],
  template: `
    <div class="cFormGroup mb-2">
      <label
        [for]="id()"
        class="dss-date-fin-label"
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

      <c-date-picker
        #datePickerHost
        #name="ngModel"
        [ngModel]="selectedDate()"
        [ngModelOptions]="{ standalone: true }"
        [calendars]="1"
        [closeOnSelect]="true"
        [disabled]="isDisabled()"
        [inputDateFormat]="formatPickerDate"
        [inputDateParse]="parsePickerDate"
        [inputReadOnly]="readonly()"
        [locale]="currentLocale()"
        [maxDate]="toDateObject()"
        [minDate]="fromDateObject()"
        [placeholder]="displayPlaceholder()"
        [size]="datePickerSize()"
        [valid]="validState()"
        (dateChange)="onDateChange($event)"
        (ngModelChange)="onDateChange($event)"
        (blur)="onTouched()"
      ></c-date-picker>
    </div>
  `,
  styles: [
    `
      .dss-date-fin-label {
        display: block;
        background-color: var(--dss-label-bg);
        color: var(--dss-label-color);
      }

      :host-context([data-coreui-theme='dark']) .dss-date-fin-label,
      :host-context([data-bs-theme='dark']) .dss-date-fin-label,
      :host-context(.dark) .dss-date-fin-label {
        background-color: var(--dss-label-dark-bg);
        color: var(--dss-label-dark-color);
      }

      :host {
        position: relative;
      }

      :host ::ng-deep c-date-picker,
      :host ::ng-deep c-dropdown {
        position: relative;
        z-index: auto;
      }

      :host ::ng-deep .date-picker-dropdown,
      :host ::ng-deep .dropdown-menu.show,
      :host ::ng-deep .calendar {
        z-index: 2000 !important;
      }
    `,
  ],
})
export class DssDateFinComponent implements AfterViewInit {
  @ViewChild('datePickerHost', { read: ElementRef })
  private datePickerHost?: ElementRef<HTMLElement>;

  private readonly dateFinService = inject(DssDateFinService);
  private readonly localeService = inject(DssLocaleService);

  id = input('');
  label = input('');
  placeholder = input('');
  labelAlign = input<'left' | 'center' | 'right'>('left');
  labelBg = input<string | null>(null);
  labelDarkBg = input<string | null>(null);
  labelColor = input<string | null>(null);
  labelDarkColor = input<string | null>(null);
  required = input(false, { transform: booleanAttribute });
  readonly = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  fin = input(false, { transform: booleanAttribute });
  minDate = input<string | Date | null>(null);
  maxDate = input<string | Date | null>(null);
  sizing = input<'sm' | 'md' | 'lg'>('sm');

  value = model<string | null>();
  private formDisabled = signal(false);
  validationTooltipVisible = signal(false);
  private onChange: (value: string | null) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  ngAfterViewInit(): void {
    queueMicrotask(() => this.disableBrowserAutocomplete());
  }

  selectedDate = computed(() => {
    const value = this.value();

    return value ? this.isoToDate(value) : null;
  });

  fromDateObject = computed(() => {
    const value = this.fromDate();

    return value ? this.toDateInstance(value) : null;
  });

  toDateObject = computed(() => {
    const value = this.toDate();

    return value ? this.toDateInstance(value) : null;
  });

  datePickerSize = computed<'sm' | 'lg' | undefined>(() => {
    const sizing = this.sizing();

    if (sizing === 'lg') return 'lg';
    if (sizing === 'md') return undefined;

    return 'sm';
  });

  validState = computed<boolean | undefined>(() => {
    if (!this.required()) return undefined;

    return !!this.value();
  });

  fromDate(): string | null {
    if (this.fin()) return this.dateFinService.fromDate();

    return this.toIsoInputValue(this.minDate());
  }

  toDate(): string | null {
    if (this.fin()) return this.dateFinService.toDate();

    return this.toIsoInputValue(this.maxDate());
  }

  currentLocale(): string {
    return this.localeService.locale();
  }

  displayPlaceholder(): string {
    return this.placeholder() || this.localeService.dateFormat();
  }

  onDateChange(value: Date | string | null | undefined): void {
    if (!value) {
      this.value.set(null);
      this.onChange(null);
      return;
    }

    if (value instanceof Date && !this.isValidDate(value)) {
      this.value.set(null);
      this.onChange(null);
      return;
    }

    const isoDate =
      value instanceof Date ? this.dateToIso(value) : this.parseDate(value);
    if (!isoDate) return;

    const nextValue = this.isDateInRange(isoDate) ? isoDate : null;
    this.value.set(nextValue);
    this.onChange(nextValue);
  }

  writeValue(value: string | Date | null): void {
    this.value.set(this.toIsoInputValue(value));
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  onTouched(): void {
    this.onTouchedCallback();
  }

  toggleValidationTooltip(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.validationTooltipVisible.update((visible) => !visible);
  }

  hideValidationTooltip(): void {
    this.validationTooltipVisible.set(false);
  }

  isDisabled(): boolean {
    return this.disabled() || this.formDisabled();
  }

  showRequiredMark(invalid: boolean | null | undefined = false): boolean {
    const value = this.value();
    const isEmpty = value === null || value === undefined || value === '';

    return this.required() && (!!invalid || isEmpty);
  }

  validationMessage(invalid: boolean | null | undefined = false): string {
    const value = this.value();
    const isEmpty = value === null || value === undefined || value === '';

    if (this.required() && isEmpty) return `${this.label()} is required.`;
    if (invalid) return `Enter a valid ${this.label().toLowerCase()}.`;

    return `${this.label()} is required.`;
  }

  formatPickerDate = (date: Date): string =>
    this.formatDate(this.dateToIso(date));

  parsePickerDate = (date: string | Date): Date => {
    if (date instanceof Date) {
      return this.isValidDate(date) && this.isDateInRange(this.dateToIso(date))
        ? date
        : new Date(Number.NaN);
    }

    const isoDate = this.parseDate(date);
    return isoDate && this.isDateInRange(isoDate)
      ? this.isoToDate(isoDate)
      : new Date(Number.NaN);
  };

  private isDateInRange(value: string): boolean {
    const fromDate = this.fromDate();
    const toDate = this.toDate();
    const isBeforeFromDate = fromDate ? value < fromDate : false;
    const isAfterToDate = toDate ? value > toDate : false;

    return !isBeforeFromDate && !isAfterToDate;
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-');

    return this.localeService.dateFormat() === 'dd/mm/yyyy'
      ? `${day}/${month}/${year}`
      : `${month}/${day}/${year}`;
  }

  private parseDate(value: string): string | null {
    const trimmedValue = value.trim();
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmedValue);

    if (isoMatch) {
      return this.toValidIsoDate(+isoMatch[1], +isoMatch[2], +isoMatch[3]);
    }

    const parts = trimmedValue.split(/\D+/).filter(Boolean);
    if (parts.length !== 3) return null;

    const order = this.getDateFormatOrder();
    const dateParts: Record<'day' | 'month' | 'year', number> = {
      day: 0,
      month: 0,
      year: 0,
    };

    order.forEach((part, index) => {
      dateParts[part] = Number(parts[index]);
    });

    return this.toValidIsoDate(dateParts.year, dateParts.month, dateParts.day);
  }

  private getDateFormatOrder(): Array<'day' | 'month' | 'year'> {
    return this.localeService.dateFormat() === 'dd/mm/yyyy'
      ? ['day', 'month', 'year']
      : ['month', 'day', 'year'];
  }

  private toValidIsoDate(
    year: number,
    month: number,
    day: number,
  ): string | null {
    const date = new Date(year, month - 1, day);
    const isValid =
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;

    if (!isValid) return null;

    return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day
      .toString()
      .padStart(2, '0')}`;
  }

  private isoToDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);

    return new Date(year, month - 1, day);
  }

  private toDateInstance(value: string | Date): Date {
    return value instanceof Date ? value : this.isoToDate(value);
  }

  private toIsoInputValue(value: string | Date | null): string | null {
    if (!value) return null;
    if (value instanceof Date) return this.dateToIso(value);

    return this.parseDate(value);
  }

  private dateToIso(value: Date): string {
    return `${value.getFullYear().toString().padStart(4, '0')}-${(
      value.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${value.getDate().toString().padStart(2, '0')}`;
  }

  private isValidDate(value: Date): boolean {
    return !Number.isNaN(value.getTime());
  }

  private disableBrowserAutocomplete(): void {
    const inputElement =
      this.datePickerHost?.nativeElement.querySelector('input');
    if (!inputElement) return;

    inputElement.setAttribute('autocomplete', 'off');
    inputElement.setAttribute('autocorrect', 'off');
    inputElement.setAttribute('autocapitalize', 'off');
    inputElement.setAttribute('spellcheck', 'false');
    inputElement.setAttribute('name', this.id() || 'dss-date-fin');
  }
}
