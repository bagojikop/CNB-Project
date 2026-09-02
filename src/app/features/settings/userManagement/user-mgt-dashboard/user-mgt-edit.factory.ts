import { FormBuilder, Validators } from '@angular/forms';
import { users } from '@shared-interfaces/settings/user';

export function createUserManagementForm(fb: FormBuilder) {
  return fb.group({
    id: fb.control<users['id'] | null>(null),

    username: fb.nonNullable.control<users['username']>('', [
      Validators.required,
    ]),


    mobileNo: fb.nonNullable.control<users['mobileNo']>('', [
      Validators.required,
      Validators.pattern(/^[0-9]+$/),
    ]),

    email: fb.control<users['email']>('', [Validators.email]),

    branch_code: fb.nonNullable.control<users['branch_code']>(''),
    branch_name: fb.control(''),

    role: fb.control<users['role'] | null>(null, [Validators.required]),


  });
}
