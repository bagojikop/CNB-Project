export interface PaymentStatus {
  id: number;
  batchId: string;
  paymentType: 'Single' | 'Bulk';
  totalAmount: number;
  partyName: string;
  paymentAgainst: string;
  requestDate: string;
  status: 'Pending' | 'Processing' | 'Success' | 'Failed' | 'Rejected';
  bankName: string;
  accountNo: string;
  requestedBy: string;
  reason?: string;
  transactionId?: string;
  transactionDate?: string;
  remarks?: string;
  bulkItems?: PaymentStatusItem[];
}

export interface PaymentStatusItem {
  id: number;
  partyName: string;
  amount: number;
  accountNo: string;
  status: 'Pending' | 'Processing' | 'Success' | 'Failed' | 'Rejected';
  transactionId?: string;
  reason?: string;
}

export interface singalPaymentAPI {
  Request: {
    body: {
      encryptData: singalPayment;
    };
  };
}

export interface singalPayment {
  Authorization: string;
  key: string;
  customerID: string;
  srcAcctNumber: string;
  txnPassword: string;
  branchCode: string;
  destAcctNumber: string;
  ifscCode: string;
  txnAmount: string;
  benefName: string;
  userRefNo: string;
  narration: string;
  valueDate: string;
  TrnType: string;
}
