import { configuration } from '@shared-interfaces/settings/configuration';

export type cinfDetlFormValue = Pick<
  configuration,
  | 'IFSC_Code'
  | 'batchId'
  | 'credDate'
  | 'accountName'
  | 'accountNo'
  | 'clientId'
  | 'clientSecretKey'
  | 'customerId'
  | 'firmId'
  | 'branchId'
  | 'firmName'
  | 'symmetric_key'
  | 'webhook_address'
  | 'static_ip'
>;
