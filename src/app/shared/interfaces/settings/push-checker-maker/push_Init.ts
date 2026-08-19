export interface CanaraBatchInitiationResponse {
  Response: CanaraResponse;
}

export interface CanaraResponse {
  body: CanaraResponseBody;
}

export interface CanaraResponseBody {
  message?: CanaraMessage;
  result?: string;
  encryptData: CanaraEncryptData;
}

export interface CanaraMessage {
  code: string;
  type: string;
}

export interface CanaraEncryptData {
  referenceNumber?: string;
  BatchRequestID?: string;
  response?: CanaraBatchInitiationResult;

  // Failure response
  Status?: string;
  Desc?: string;
}

export interface CanaraBatchInitiationResult {
  batchReferenceNo?: string;
  result?: CanaraBatchResult;
  TRANSACTION_REF_NO?: string;
}

export interface CanaraBatchResult {
  rcode?: string | Record<string, unknown>;
  rdesc?: string;
}
