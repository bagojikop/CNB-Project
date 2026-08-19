import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { vanCreationFormValue } from './van-creation-edit.module';

export function createVanCreation(fb: FormBuilder) {
  return fb.group({
    id: fb.nonNullable.control<string>(''),
    mode: fb.nonNullable.control<string>('custom'),
    custom: fb.group({
      accountNo: fb.nonNullable.control<
        vanCreationFormValue['Request']['body']['encryptData']['accountNo']
      >('', [Validators.required]),
      startDate: fb.nonNullable.control<
        vanCreationFormValue['Request']['body']['encryptData']['startDate']
      >(new Date().toISOString().split('T')[0], [Validators.required]),
      endDate: fb.nonNullable.control<
        vanCreationFormValue['Request']['body']['encryptData']['endDate']
      >(new Date().toISOString().split('T')[0], [Validators.required]),
      countVAN: fb.nonNullable.control<
        vanCreationFormValue['Request']['body']['encryptData']['countVAN']
      >(3, [Validators.required, Validators.min(1)]),
      virtualAccountDetails: fb.array<
        vanCreationFormValue['Request']['body']['encryptData']['virtualAccountDetails']
      >([]),
    }),
    random: fb.group({
      accountNo: fb.nonNullable.control<
        vanCreationFormValue['Request']['body']['encryptData']['accountNo']
      >('', [Validators.required]),
      startDate: fb.nonNullable.control<
        vanCreationFormValue['Request']['body']['encryptData']['startDate']
      >(new Date().toISOString().split('T')[0], [Validators.required]),
      endDate: fb.nonNullable.control<
        vanCreationFormValue['Request']['body']['encryptData']['endDate']
      >(new Date().toISOString().split('T')[0], [Validators.required]),
      countVAN: fb.nonNullable.control<
        vanCreationFormValue['Request']['body']['encryptData']['countVAN']
      >(1, [Validators.required, Validators.min(1), Validators.max(500)]),
    }),
  });
}
