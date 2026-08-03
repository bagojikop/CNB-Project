export interface VirtualAccountDetail {
  vanNumber: string;
}

export interface EncryptData {
  accountNo: string;
  startDate: string;
  endDate: string;
  countVAN: string; // server expects string
  virtualAccountDetails?: VirtualAccountDetail[];
}

export interface RequestBody {
  encryptData: EncryptData;
}

export interface CreateVANRequest {
  id: string;
  Request: {
    body: RequestBody;
  };
}
