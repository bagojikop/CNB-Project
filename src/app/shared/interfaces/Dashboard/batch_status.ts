export interface BatchStatusCanaraBank {
  batchId: string;
  status: string;
  statusMessage?: string;
  totalAmount: number;
  transactionCount: number;
  processedDate?: string;
  bankReferenceNo?: string;
  errorCode?: string;
  errorMessage?: string;
}
