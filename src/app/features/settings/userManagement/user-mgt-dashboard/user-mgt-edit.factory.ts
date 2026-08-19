import { FormBuilder, Validators } from '@angular/forms';
import { userMgt } from '@shared-interfaces/settings/user';

export function createUserManagementForm(fb: FormBuilder) {
  return fb.group({
    id: fb.control<userMgt['id'] | null>(null),

    username: fb.nonNullable.control<userMgt['username']>('', [
      Validators.required,
    ]),

    password: fb.nonNullable.control<userMgt['password']>('', [
      Validators.required,
    ]),

    mobileNo: fb.nonNullable.control<userMgt['mobileNo']>('', [
      Validators.required,
      Validators.pattern(/^[0-9]+$/),
    ]),

    email: fb.control<userMgt['email']>('', [Validators.email]),

    branch_code: fb.nonNullable.control<userMgt['branch_code']>('', [
      Validators.required,
    ]),
    branch_name: fb.control(''),

    role: fb.control<userMgt['role'] | null>(null, [Validators.required]),

    roleName: fb.control<userMgt['roleName'] | null>(null, [
      Validators.required,
    ]),
  });
}
