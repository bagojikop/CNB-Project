import { userMgt } from '@shared-interfaces/settings/user';

export type userMgtFormValue = Pick<
  userMgt,
  'username' | 'email' | 'password' | 'role'
>;
