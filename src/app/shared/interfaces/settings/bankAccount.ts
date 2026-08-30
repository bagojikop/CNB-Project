export interface bankAccount {
  id: number | null;
  firmId: number;
  credDate?: string;
  credUser?: string;
  branchId: string;
  firmName: string;
  accountNo: string;
  branchCode: string;
  accountName: string;
  ifsc_Code: string | null;
  customerId: string;
  clientId: string;
  accessToken: string;
  redirectUrl: string;
  responseType: string;
  state: string;
  scope: string;
  apiUserName: string;
  apiLoginPassword: string;
  apiTxnPassword: string;
  clientSecretKey: string;
  symmetric_Key: string;

  enc_Key: string;
}

export interface PasswordModalForm {
  password: string;
  enc_Key: string;
  mobile_no: string;
  mobile_otp: string;
  encrypted_psw: string;
}
