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

    email: fb.control<userMgt['email']>('', [Validators.email]),

    role: fb.control<userMgt['role'] | null>(null, [Validators.required]),
    roleName: fb.control<userMgt['roleName'] | null>(null, [
      Validators.required,
    ]),
  });
}
