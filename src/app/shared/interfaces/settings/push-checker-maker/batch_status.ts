export interface BatchStatus {
  Request: {
    body: {
      encryptData: {
        Authorization: string;
        key: string;
        TFAPassword: string;
        customerID: string;
        BatchRequestID: string;
      };
    };
  };
}
