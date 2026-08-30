import { bankAccount } from '@shared-interfaces/settings/bankAccount';

export type cinfDetlFormValue = Pick<
  bankAccount,
  | 'ifsc_Code'
  | 'id'
  | 'credDate'
  | 'credUser'
  | 'accountName'
  | 'accountNo'
  | 'branchCode'
  | 'clientId'
  | 'accessToken'
  | 'redirectUrl'
  | 'responseType'
  | 'state'
  | 'scope'
  | 'apiUserName'
  | 'apiLoginPassword'
  | 'apiTxnPassword'
  | 'clientSecretKey'
  | 'customerId'
  | 'firmId'
  | 'branchId'
  | 'firmName'
  | 'symmetric_Key'
  | 'enc_Key'
>;
