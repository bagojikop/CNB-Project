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
  selector: 'dss-dialog',
  templateUrl: 'dss-dialog.html',
  imports: [ReactiveFormsModule, DSS_FORM_CONTROLS],
})
export class dilogForm {
  @Input() isShow = false;
  @Output() isShowChange = new EventEmitter<boolean>();
  @Output() result = new EventEmitter();

  modalClose() {
    this.isShow = false;
    this.isShowChange.emit(false);
  }

  save() {
    this.result.emit();
  }
}
