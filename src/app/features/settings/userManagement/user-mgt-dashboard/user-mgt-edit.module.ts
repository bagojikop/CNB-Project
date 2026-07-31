import { userMgt } from '@shared-interfaces/settings/user';

export type userMgtFormValue = Pick<
  userMgt,
  'id' | 'username' | 'email' | 'password' | 'role' | 'roleName' | 'mobileNo'
>;
