export interface configuration {
  id: string;
  firmId: string;
  credDate?: string;
  credUser?: string;
  branchId: string;
  firmName: string;
  accountNo: string;
  accountName: string;
  IFSC_Code: string | null;
  customerId: string;
  clientId: string;
  static_ip: string;
  clientSecretKey: string;
  symmetric_key: string;
  webhook_address: string;
  modalForm?: modalForm | null;
}

export interface modalForm {
  txn_password: string;
  mobile_no: string;
  mobile_otp: string;
  encrypted_psw: string;
}
