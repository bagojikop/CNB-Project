import {
  Component,
  EventEmitter,
  inject,
  Input,
  input,
  Output,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';

@Component({
  selector: 'dss-otp-dialog',
  templateUrl: 'otp-dialog.html',
  imports: [ReactiveFormsModule, DSS_FORM_CONTROLS],
})
export class otpForm {
  private fb = inject(FormBuilder);
  @Input() isShow = false;
  @Output() isShowChange = new EventEmitter<boolean>();
  @Output() result = new EventEmitter();

  otpForm = this.fb.nonNullable.group({
    otp: [
      '',
      [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
    ],
  });

  modalClose() {
    this.isShow = false;
    this.isShowChange.emit(false);
    this.otpForm.reset();
  }

  save() {
    const otp = this.otpForm.getRawValue();
    this.result.emit(otp);
    this.otpForm.reset();
  }
}
