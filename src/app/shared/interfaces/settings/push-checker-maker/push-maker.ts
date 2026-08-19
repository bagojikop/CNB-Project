export interface BatchRequest {
  Request: {
    body: {
      encryptData: EncryptData;
    };
  };
}

export interface EncryptData {
  Authorization: string;
  Key: string;
  CustomerID: string;
  TotAmt: string;
  TxnCnt: string;
  DatTxn: string;
  ExternalReferenceno: string;
  BatchRequestID: string;
  TxnDtls: TxnDetails;
}

export interface TxnDetails {
  Txn: Transaction[];
}

export interface Transaction {
  TxnRefNo: string;
  DrAcct: string;
  SndrNm: string;
  TxnAmt: string;
  TxnType: string;
  BenefIFSC: string;
  BenefAcNo: string;
  BenefAcNm: string;
  Nrtv: string;
}
