import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cinfDetlFormValue } from './conf-detail.module';

export function createConfigurationForm(fb: FormBuilder) {
  return fb.group({
    id: fb.nonNullable.control<cinfDetlFormValue['id']>(''),

    firmId: fb.nonNullable.control<cinfDetlFormValue['firmId']>('', [
      Validators.required,
    ]),

    credDate: fb.control<cinfDetlFormValue['credDate'] | null>(null),

    credUser: fb.control<cinfDetlFormValue['credUser'] | null>(null),

    branchId: fb.nonNullable.control<cinfDetlFormValue['branchId']>('', [
      Validators.required,
    ]),

    firmName: fb.nonNullable.control<cinfDetlFormValue['firmName']>('', [
      Validators.required,
      Validators.maxLength(100),
    ]),

    accountNo: fb.nonNullable.control<cinfDetlFormValue['accountNo']>('', [
      Validators.required,
      Validators.maxLength(12),
      Validators.minLength(14),
    ]),

    accountName: fb.nonNullable.control<cinfDetlFormValue['accountName']>('', [
      Validators.required,
      Validators.maxLength(100),
    ]),

    // Optional IFSC Code
    IFSC_Code: fb.control<cinfDetlFormValue['IFSC_Code']>('', [
      Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
    ]),

    customerId: fb.nonNullable.control<cinfDetlFormValue['customerId']>('', [
      Validators.required,
      Validators.maxLength(15),
    ]),

    clientId: fb.nonNullable.control<cinfDetlFormValue['clientId']>('', [
      Validators.required,
      Validators.maxLength(100),
    ]),

    clientSecretKey: fb.nonNullable.control<
      cinfDetlFormValue['clientSecretKey']
    >('', [Validators.required, Validators.maxLength(500)]),

    symmetric_key: fb.nonNullable.control<cinfDetlFormValue['symmetric_key']>(
      '',
      [Validators.required, Validators.maxLength(500)],
    ),

    webhook_address: fb.nonNullable.control<
      cinfDetlFormValue['webhook_address']
    >('', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]),

    static_ip: fb.nonNullable.control<cinfDetlFormValue['static_ip']>('', [
      Validators.required,
      Validators.pattern(/^https?:\/\/.+/),
    ]),

    modalForm: fb.control<ReturnType<typeof createModalForm>['value'] | null>(
      null,
    ),
  });
}

export function createModalForm(fb: FormBuilder) {
  return fb.group({
    txn_password: fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(500),
    ]),

    mobile_otp: fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(500),
    ]),

    mobile_no: fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(500),
    ]),

    encrypted_psw: fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(500),
    ]),
  });
}
