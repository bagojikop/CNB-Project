import { users } from '@shared-interfaces/settings/user';

export type userMgtFormValue = Pick<
  users,
  | 'id'
  | 'username'
  | 'email'
  | 'role'
  | 'mobileNo'
  | 'branch_code'
>;
