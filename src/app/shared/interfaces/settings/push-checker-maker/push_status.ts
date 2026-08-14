export interface CanaraBatchStatusResponse {
  Response: CanaraBatchStatusResponseData;
}

export interface CanaraBatchStatusResponseData {
  status: CanaraApiStatus;
  body: CanaraBatchStatusBody;
}

export interface CanaraApiStatus {
  message: CanaraApiMessage;
  result: string;
}

export interface CanaraApiMessage {
  code: string;
  type: string;
}

export interface CanaraBatchStatusBody {
  encryptData: CanaraBatchStatusData;
}

export interface CanaraBatchStatusData {
  batchRequestId: string;
  batchStatus: string;

  TotAmt: string;
  TxnCnt: string;

  Initiated_By: string;
  Initiated_Date: string;

  Approved_By: string;
  Approved_Date: string;

  bulkResponse: CanaraBulkResponse;
}

export interface CanaraBulkResponse {
  bulkRefDet: CanaraTransactionDetail[];
}

export interface CanaraTransactionDetail {
  amount: string;
  creditAccountId: string;
  debitAccountId: string;

  externalReferenceId?: string;

  ifscCode: string;
  recRefId: string;

  status: string;
  systemReferenceId: string;
  txnRefNo: string;

  TxnType: string;

  txnType?: string;

  Benename: string;
  Nrtv: string;

  trnsStatus?: string;
  reason?: string;
}
