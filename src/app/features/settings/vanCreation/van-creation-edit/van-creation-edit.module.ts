import { CreateVANRequest } from '@shared-interfaces/settings/van-creation';

export type vanCreationFormValue = Pick<CreateVANRequest, 'Request'> & {
  Request: {
    body: {
      encryptData: Pick<
        CreateVANRequest['Request']['body']['encryptData'],
        | 'accountNo'
        | 'startDate'
        | 'endDate'
        | 'countVAN'
        | 'virtualAccountDetails'
      >;
    };
  };
};
