export interface BatchInquiryResponse {
  Response: {
    body: {
      encryptData: BatchInquiryData;
    };
  };
}

export interface BatchInquiryData {
  UserName: string;
  CustomerID: string;
  TotAmt: string;
  TxnCnt: string;
  DatTxn: string;
  BatchRequestID: string;
  TxnRefNo: string;

  TotNeftAmt: string;
  TxnNeftCnt: string;

  TotRtgsAmt: string;
  TxnRtgsCnt: string;

  TotImpsAmt: string;
  TxnImpsCnt: string;

  TotIntraAmt: string;
  TxnIntraCnt: string;

  TxnDtls: {
    Txn: BatchInquiryTransaction[];
  };
}

export interface BatchInquiryTransaction {
  TxnRefNo: string;
  DrAcct: string;
  SndrNm: string;
  TxnAmt: string;
  TxnType: string;

  BenefIFSC?: string;
  BenefAcNo: string;
  BenefAcNm: string;
  Nrtv: string;

  utr_RRN_Number?: string;

  TxnStatus: string;
  Txn_init_date: string;

  Approved_By: string;
  Approved_Date: string;
}
