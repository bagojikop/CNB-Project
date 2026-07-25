import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  OnInit,
  ViewChild,
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
  NgControl,
  Validators,
} from '@angular/forms';
import { FormModule, TooltipModule } from '@coreui/angular-pro';
import { CaseStyleDirective } from './case-style.directive';
import { CaseStyle } from './case-style-enum';
import { IconModule } from '@coreui/icons-angular';

@Component({
  selector: 'dss-input-text',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormModule,
    TooltipModule,
    CaseStyleDirective,
    IconModule,
  ],
  host: {
    '[style.display]': 'controlWidth() ? "block" : null',
    '[style.width]': 'normalizedControlWidth()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DssInputTextComponent),
      multi: true,
    },
  ],
  template: `
    <div class="cFormGroup mb-2">
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
        @if (icon()) {
          <svg cIcon name="{{ icon() }}"></svg>
        }
        {{ label() }}
        @if (showRequiredMark()) {
          <span
            class="dss-validation-error"
            role="button"
            tabindex="0"
            [cTooltip]="requiredTooltipMessage()"
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
      <c-input-group class="has-validation">
        @if (textarea()) {
          <textarea
            #inputElement
            cFormControl
            [sizing]="sizing()"
            [class.form-control-sm]="sizing() === 'sm'"
            [class.form-control-md]="sizing() === 'md'"
            [class.form-control-lg]="sizing() === 'lg'"
            [id]="id()"
            [rows]="rows()"
            [placeholder]="placeholder()"
            [ngModel]="value()"
            [caseStyle]="caseStyle()"
            [required]="isRequired()"
            [minlength]="minlength()"
            [maxlength]="maxlength()"
            [pattern]="pattern()"
            [readonly]="readonly()"
            [disabled]="isDisabled()"
            [ngModelOptions]="{ standalone: true }"
            (blur)="onTouched()"
            (ngModelChange)="onValueChange($event)"
          ></textarea>
        } @else {
          <input
            #inputElement
            cFormControl
            [sizing]="sizing()"
            [class.form-control-sm]="sizing() === 'sm'"
            [class.form-control-md]="sizing() === 'md'"
            [class.form-control-lg]="sizing() === 'lg'"
            [id]="id()"
            autocomplete="new-password"
            [type]="type()"
            [placeholder]="placeholder()"
            [ngModel]="value()"
            [caseStyle]="caseStyle()"
            [required]="isRequired()"
            [minlength]="minlength()"
            [maxlength]="maxlength()"
            [pattern]="pattern()"
            [readonly]="readonly()"
            [disabled]="isDisabled()"
            [ngModelOptions]="{ standalone: true }"
            (blur)="onTouched()"
            (ngModelChange)="onValueChange($event)"
          />
        }
      </c-input-group>
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
export class DssInputTextComponent implements OnInit {
  private readonly injector = inject(Injector);
  @ViewChild('inputElement') private inputElement?: ElementRef<
    HTMLInputElement | HTMLTextAreaElement
  >;

  id = input('');
  label = input('');
  placeholder = input('');
  labelAlign = input<'left' | 'center' | 'right'>('left');
  labelBg = input<string | null>(null);
  labelDarkBg = input<string | null>(null);
  labelColor = input<string | null>(null);
  labelDarkColor = input<string | null>(null);
  type = input('text');
  caseStyle = input<CaseStyle | string | null>(null);
  required = input(false, { transform: booleanAttribute });
  readonly = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  textarea = input(false, { transform: booleanAttribute });
  rows = input<string | number>(3);
  minlength = input<string | number | null>(null);
  maxlength = input<string | number | null>(null);
  pattern = input<string | RegExp | null>(null);
  controlWidth = input<string | number | null>(null, { alias: 'width' });
  icon = input<string>('');

  value = model<any>();
  sizing = input<'sm' | 'md' | 'lg'>('sm');
  private formDisabled = signal(false);
  validationTooltipVisible = signal(false);
  private ngControl: NgControl | null = null;
  private onChange: (value: any) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  ngOnInit(): void {
    this.ngControl = this.injector.get(NgControl, null, {
      self: true,
      optional: true,
    });
  }

  writeValue(value: any): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  focus(): void {
    this.inputElement?.nativeElement.focus();
  }

  onValueChange(value: any): void {
    const nextValue =
      typeof value === 'string' ? this.applyCaseStyle(value) : value;

    this.value.set(nextValue);
    this.onChange(nextValue);
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
    const control = this.ngControl?.control;
    const value = this.value();
    const isEmpty = value === null || value === undefined || value === '';
    const showInvalidMark =
      !!control && control.invalid && (control.touched || control.dirty);

    return showInvalidMark || (this.isRequired() && (!!invalid || isEmpty));
  }

  isRequired(): boolean {
    return (
      this.required() ||
      !!this.ngControl?.control?.hasValidator(Validators.required)
    );
  }

  showValidationMessage(): boolean {
    const control = this.ngControl?.control;

    return !!control && control.invalid && (control.touched || control.dirty);
  }

  validationMessage(): string {
    const errors = this.ngControl?.control?.errors;

    if (!errors) return '';
    if (errors['required']) return `${this.label()} is required.`;
    if (errors['email'] || errors['pattern'])
      return `Enter a valid ${this.label().toLowerCase()}.`;
    if (errors['minlength']) return `${this.label()} is too short.`;
    if (errors['maxlength']) return `${this.label()} is too long.`;

    return `Enter a valid ${this.label().toLowerCase()}.`;
  }

  requiredTooltipMessage(): string {
    return this.validationMessage() || `${this.label()} is required.`;
  }

  normalizedControlWidth(): string | null {
    const width = this.controlWidth();

    if (width === null || width === undefined || width === '') return null;

    const normalizedWidth = typeof width === 'number' ? `${width}px` : width;

    return `min(100%, ${normalizedWidth})`;
  }

  private applyCaseStyle(value: string): string {
    switch (this.caseStyle()) {
      case CaseStyle.LOWERCASE:
        return value.toLowerCase();
      case CaseStyle.TITLECASE:
        return value
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase());
      case CaseStyle.UPPERCASE:
        return value.toUpperCase();
      default:
        return value;
    }
  }
}
