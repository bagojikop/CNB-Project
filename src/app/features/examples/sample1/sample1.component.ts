import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormModule, ColComponent, IColumn, RowComponent,ButtonDirective } from '@coreui/angular-pro';
import { DSS_FORM_CONTROLS, NavType, CaseStyle } from '@shared-directives/dss-form-controls';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
 
@Component({
  selector: 'app-sample1',
  standalone: true,
  imports: [ReactiveFormsModule, FormModule, DSS_FORM_CONTROLS, ButtonDirective,ColComponent, RowComponent],
  templateUrl: './sample1.component.html',
  styleUrl: './sample1.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Sample1Component {
  readonly navType = NavType;
  readonly caseStyle = CaseStyle;

  readonly sample1Form = this.fb.group({
    input1: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.minLength(5)],
    }),
    input2: this.fb.nonNullable.control(''),
    input3: this.fb.nonNullable.control(''),
    input11: this.fb.nonNullable.control(''),
    input12: this.fb.nonNullable.control(''),
    input13: this.fb.nonNullable.control(''),
    agreeTerms: this.fb.nonNullable.control(false),
    status: this.fb.nonNullable.control('active'),
    sampleDate: this.fb.control<string | null>(null),
    select1: this.fb.control<string | null>(null),
    recpayeeaccount: this.fb.control<number | null>(null, {
      validators: [Validators.required],
    }),
    finDate: this.fb.control<string | null>(null, {
      validators: [Validators.required],
    }),
    number: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(1), Validators.max(999)],
    }),
    simpleAmount: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(1), Validators.max(999)],
    }),
    currencyAmount: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(1), Validators.max(999)],
    }),
    currencySymbolAmount: this.fb.control<number | null>(null),
  });

  constructor(private fb: FormBuilder) {}

  columns: (IColumn | string)[] = [
    {
      key: 'Acc_name',
      label: 'Account',
      _style: { width: '35%' },
      _props: { color: 'danger', class: 'fw-bold' },
      _colClass: 'text-center fw-bold'
    },
    {
      key: 'City_name',
      label: 'City',
      _style: { width: '25%' }
    },
    {
      key: 'acc_code',
      label: 'Code',
      filter: false,
      sorter: false,
      _style: { width: '15%' },
      _classes: 'text-muted small'
    },
    {
      key: 'mst003.sg_name',
      label: 'Group',
      _style: { width: '25%' }
    }
  ];

  get f() {
    return this.sample1Form.controls;
  }

  handleAction(event: any): void {
    console.log('Action handled!');
  }

  save(): void {
    if (this.sample1Form.invalid) {
      this.sample1Form.markAllAsTouched();
      return;
    }

    console.log('Sample 1 form', this.sample1Form.getRawValue());
  }

  onGridEdit(item: any): void {
    console.log('Edit row', item);
  }

  onGridDelete(item: any): void {
    console.log('Delete row', item);
  }
}
