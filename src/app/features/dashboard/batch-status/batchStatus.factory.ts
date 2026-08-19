import { FormBuilder, Validators } from '@angular/forms';
import { batchStatusFormValue } from './batch-status.module';

export function createBatchStatusForm(fb: FormBuilder) {
  return fb.group({
    batchId: fb.nonNullable.control<
      batchStatusFormValue['Request']['body']['encryptData']['BatchRequestID']
    >('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(20),
    ]),
    status: fb.nonNullable.control<
      batchStatusFormValue['Request']['body']['encryptData']['Authorization']
    >('', Validators.required),
    statusMessage:
      fb.nonNullable.control<
        batchStatusFormValue['Request']['body']['encryptData']['key']
      >(''),
    totalAmount: fb.nonNullable.control<
      batchStatusFormValue['Request']['body']['encryptData']['TFAPassword']
    >('', [Validators.required, Validators.min(0)]),
    transactionCount: fb.nonNullable.control<
      batchStatusFormValue['Request']['body']['encryptData']['customerID']
    >('', [Validators.required, Validators.min(0)]),
    processedDate:
      fb.nonNullable.control<
        batchStatusFormValue['Request']['body']['encryptData']['key']
      >(''),
    bankReferenceNo: fb.nonNullable.control<string>(''),
    errorCode: fb.nonNullable.control<string>(''),
    errorMessage: fb.nonNullable.control<string>(''),
  });
}
