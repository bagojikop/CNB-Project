export interface TransactionReportResponse {
  Response: {
    body: {
      encryptData: TransactionReportData;
    };
  };
}

export interface TransactionReportData {
  mid: string;
  sid: string;
  terminalId: string;
  startDate: string;
  endDate: string;
  checksum: string;
  status: string;
  txnType: string;
  pageSize: string;
  pageNo: string;
  data: TransactionReportItem[];
}

export interface TransactionReportItem {
  customerName: string;
  respCode: string;
  respMessge: string;
  upiTxnId: string;
  txnTime: string;
  amount: string;
  upiId: string;
  extTransactionId: string;
  custRefNo: string;
  remark: string;
}
