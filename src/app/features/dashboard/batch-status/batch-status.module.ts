import { bankAccount } from '@shared-interfaces/settings/bankAccount';
import { BatchStatus } from '@shared-interfaces/settings/push-checker-maker/batch_status';

export type batchStatusFormValue = Pick<BatchStatus, 'Request'> & {
  Request: {
    body: {
      encryptData: Pick<
        BatchStatus['Request']['body']['encryptData'],
        | 'Authorization'
        | 'key'
        | 'TFAPassword'
        | 'customerID'
        | 'BatchRequestID'
      >;
    };
  };
};
