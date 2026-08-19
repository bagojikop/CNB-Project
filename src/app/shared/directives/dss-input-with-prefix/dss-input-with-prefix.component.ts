import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'dss-input-with-prefix',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-group.component.html',
  styleUrls: ['./input-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DssInputWithPrefixComponent),
      multi: true,
    },
  ],
})
export class DssInputWithPrefixComponent implements ControlValueAccessor {
  // Label
  @Input() label = '';

  // Placeholders
  @Input() firstPlaceholder = '';
  @Input() secondPlaceholder = '';

  // First input width
  @Input() firstWidth = '120px';

  // Size
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  // Required indicator
  @Input() required = false;

  // Change event
  @Output() valueChange = new EventEmitter<string>();

  // Blur event
  @Output() valueBlur = new EventEmitter<string>();

  firstValue = '';
  secondValue = '';

  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.firstValue = value ?? '';
    this.secondValue = '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private getCombinedValue(): string {
    const first = this.firstValue.trim();
    const second = this.secondValue.trim();

    if (first && second) {
      return `${first} ${second}`;
    }

    return first || second;
  }

  onInputChange(): void {
    const value = this.getCombinedValue();

    // Reactive Form
    this.onChange(value);

    // Parent event
    this.valueChange.emit(value);
  }

  onInputBlur(): void {
    const value = this.getCombinedValue();

    // Reactive Form touched
    this.onTouched();

    // Parent event
    this.valueBlur.emit(value);
  }
}
