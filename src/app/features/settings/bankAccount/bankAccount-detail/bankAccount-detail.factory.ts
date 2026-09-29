import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { cinfDetlFormValue } from './bankAccount-detail.module';

export function createConfigurationForm(fb: FormBuilder) {
  return fb.group({
    mcc: fb.control<string | null>(null, [Validators.maxLength(10)]),
    sid: fb.control<string | null>(null, [Validators.maxLength(10)]),
    mid: fb.control<string | null>(null, [Validators.maxLength(10)]),
    terminalId: fb.control<string | null>(null, [Validators.maxLength(10)]),
    id: fb.nonNullable.control<cinfDetlFormValue['id']>(null),

    firmId: fb.nonNullable.control<cinfDetlFormValue['firmId']>(0, [
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

    ]),

    branchCode: fb.nonNullable.control<cinfDetlFormValue['branchCode']>('', [
      Validators.required,
      Validators.maxLength(20),
    ]),

    accountName: fb.nonNullable.control<cinfDetlFormValue['accountName']>('', [
      Validators.required,
      Validators.maxLength(100),
    ]),

    // Optional IFSC Code
    ifsc_Code: fb.control<cinfDetlFormValue['ifsc_Code']>('', [
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

    accessToken: fb.nonNullable.control<cinfDetlFormValue['accessToken']>('', [
      Validators.required,
      Validators.maxLength(500),
    ]),

    redirectUrl: fb.nonNullable.control<cinfDetlFormValue['redirectUrl']>(''),
    responseType:
      fb.nonNullable.control<cinfDetlFormValue['responseType']>('code'),
    state: fb.nonNullable.control<cinfDetlFormValue['state']>('acdfgb'),
    scope: fb.nonNullable.control<cinfDetlFormValue['scope']>('collection'),

    apiUserName: fb.nonNullable.control<
      cinfDetlFormValue['apiUserName']
    >('', [Validators.required, Validators.maxLength(100)]),

    enc_Key: fb.nonNullable.control<
      cinfDetlFormValue['enc_Key']
    >('', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]),

    apiLoginPassword: fb.nonNullable.control<
      cinfDetlFormValue['apiLoginPassword']
    >('', [Validators.required, Validators.maxLength(500)]),

    apiTxnPassword: fb.nonNullable.control<cinfDetlFormValue['apiTxnPassword']>(''),

    clientSecretKey: fb.nonNullable.control<
      cinfDetlFormValue['clientSecretKey']
    >('', [Validators.required, Validators.maxLength(500)]),

    symmetric_Key: fb.nonNullable.control<cinfDetlFormValue['symmetric_Key']>(
      '',
      [Validators.required, Validators.maxLength(500)],
    ),



  });
}

export function createPasswordModalForm(fb: FormBuilder) {
  return fb.group({
    password: fb.nonNullable.control('', [
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

export function createAccessTokenForm(fb: FormBuilder) {
  return fb.group({
    url: fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^https?:\/\/.+/),
    ]),
    redirectUrl: fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^https?:\/\/.+/),
    ]),
    responseType: fb.nonNullable.control('code', [Validators.required]),
    state: fb.nonNullable.control('acdfgb', [Validators.required]),
    scope: fb.nonNullable.control('collection', [Validators.required]),
    authorizationCode: fb.nonNullable.control(''),
  });
}
