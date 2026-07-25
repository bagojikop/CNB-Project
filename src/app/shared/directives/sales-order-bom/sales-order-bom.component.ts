import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective } from '@coreui/angular-pro';
import { DssInputNumComponent, NgCustomSelectComponent } from '@shared-directives/dss-form-controls';

@Component({
  standalone: true,
  selector: 'app-sales-order-bom',
  imports: [
    FormsModule,
    NgCustomSelectComponent,
    DssInputNumComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    ModalTitleDirective,
    ButtonDirective,
    ReactiveFormsModule,


  ],
  templateUrl: './sales-order-bom.component.html',
  styleUrl: './sales-order-bom.component.scss'
})
export class SalesOrderBomComponent {

  constructor(private fb: FormBuilder) {
    this.form = this.createForm();

    this.registerCalculationEvents();
  }

  visible = false;

  form: FormGroup;

  @Output()
  save = new EventEmitter<any>();

  private createForm(): FormGroup {
    return this.fb.group({
      i_id: [null],
      i_unit: [''],
      deliveryMode: [1],
      mrp: [0],
      cases: [0],
      i_caseqty: [1], // Required for calcQty() 
      qty: [0],
      incltaxrate: [0],
      rate: [0],
      grossamt: [0],
      disc_type: [1],
      disc_rate: [0],
      discamt: [0],
      taxableamt: [0],
      other_charges: [0],
      crate: [0],
      srate: [0],
      irate: [0],
      csrate: [0],
      camt: [0],
      samt: [0],
      iamt: [0],
      csamt: [0],
      taxAmt: [0],
      totalamt: [0],
      life_type: [1],
      life: [0]
    });
  }

  open(form: FormGroup) {
    this.form = form ?? this.createForm();
    this.form.markAsPristine();
    this.visible = true;
  }


  deliveryModes = [
    { id: 1, name: 'For' },
    { id: 2, name: 'Ex' }
  ];

  Discon = [
    { id: 1, name: 'On base Value' },
    { id: 2, name: 'On Quantity' },
    { id: 3, name: 'Discount Amount' }
  ]

  lifetypes = [
    { id: 1, name: 'Not Applicable' },
    { id: 2, name: 'KM' },
    { id: 3, name: 'Month' }
  ]


  close() {
    this.visible = false;
  }

  clear() {
    if (this.form) {
      this.form.reset();
    }
  }

  saveData() {
    if (!this.form) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.save.emit(this.form.getRawValue());
    this.close();
  }



  roundN(value: number, decimals: number = 2): number {
    if (!value) return 0;
    return Number(value.toFixed(decimals));
  }

  private registerCalculationEvents() {

    this.form.get('cases')?.valueChanges.subscribe(() => this.calcQty());

    this.form.get('qty')?.valueChanges.subscribe(() => this.calcTotal());

    this.form.get('rate')?.valueChanges.subscribe(() => this.calcTotal());

    this.form.get('incltaxrate')?.valueChanges.subscribe(() => this.calcBasicRate());

    this.form.get('disc_rate')?.valueChanges.subscribe(() => this.calcDiscount());

    this.form.get('disc_type')?.valueChanges.subscribe(() => this.calcDiscount());

    this.form.get('crate')?.valueChanges.subscribe(() => this.calcGST());

    this.form.get('srate')?.valueChanges.subscribe(() => this.calcGST());

    this.form.get('irate')?.valueChanges.subscribe(() => this.calcGST());

    this.form.get('csrate')?.valueChanges.subscribe(() => this.calcGST());

    this.form.get('other_charges')?.valueChanges.subscribe(() => this.calcGST());

  }

  calcGST(): void {

    const calctax = true; // Replace with your actual flag

    const taxableamt = Number(this.form.get('taxableamt')?.value || 0);

    const crate = Number(this.form.get('crate')?.value || 0);
    const srate = Number(this.form.get('srate')?.value || 0);
    const irate = Number(this.form.get('irate')?.value || 0);
    const csrate = Number(this.form.get('csrate')?.value || 0);

    let camt = 0;
    let samt = 0;
    let iamt = 0;
    let csamt = 0;
    let totalamt = taxableamt;

    if (calctax) {

      camt = this.roundN((taxableamt * crate) / 100, 2);
      samt = this.roundN((taxableamt * srate) / 100, 2);
      iamt = this.roundN((taxableamt * irate) / 100, 2);
      csamt = this.roundN((taxableamt * csrate) / 100, 2);

      totalamt = this.roundN(
        taxableamt + camt + samt + iamt + csamt,
        2
      );
    }

    const taxAmt = this.roundN(camt + samt + iamt + csamt, 2);

    this.form.patchValue({
      camt,
      samt,
      iamt,
      csamt,
      taxAmt,
      totalamt
    }, { emitEvent: false });

  }

  calcDiscount(): void {

    const grossamt = Number(this.form.get('grossamt')?.value || 0);
    const qty = Number(this.form.get('qty')?.value || 0);

    const discRate = Number(this.form.get('disc_rate')?.value || 0);
    const discType = Number(this.form.get('disc_type')?.value || 0);

    let discamt = 0;

    switch (discType) {

      case 1:
        // Percentage
        discamt = this.roundN((grossamt * discRate) / 100, 2);
        break;

      case 2:
        // Per Qty
        discamt = this.roundN(qty * discRate, 2);
        break;

      default:
        // Fixed Amount
        discamt = discRate;
        break;
    }

    const taxableamt = this.roundN(grossamt - discamt, 2);

    this.form.patchValue({
      discamt,
      taxableamt
    }, { emitEvent: false });

    this.calcGST();

  }

  calcTotal(): void {

    const qty = Number(this.form.get('qty')?.value || 0);
    const rate = Number(this.form.get('rate')?.value || 0);

    const grossamt = this.roundN(qty * rate, 2);

    this.form.patchValue({
      grossamt
    }, { emitEvent: false });

    this.calcDiscount();

  }

  calcQty(): void {

    const cases = Number(this.form.get('cases')?.value || 0);
    const caseQty = Number(this.form.get('i_caseqty')?.value || 1);

    const qty = this.roundN(cases * caseQty, 3);

    this.form.patchValue({
      qty
    }, { emitEvent: false });

    this.calcTotal();

  }

  calcBasicRate(): void {

    const calctax = true; // Replace with your actual variable

    const incltaxrate = Number(this.form.get('incltaxrate')?.value || 0);

    const crate = Number(this.form.get('crate')?.value || 0);
    const srate = Number(this.form.get('srate')?.value || 0);
    const irate = Number(this.form.get('irate')?.value || 0);

    let rate = incltaxrate;

    if (calctax) {

      const gstRate = this.roundN(
        crate + srate + irate,
        2
      );

      rate = this.roundN(
        (incltaxrate * 100) / (100 + gstRate),
        2
      );
    }

    this.form.patchValue({
      rate
    }, { emitEvent: false });

    this.calcTotal();

  }
}
