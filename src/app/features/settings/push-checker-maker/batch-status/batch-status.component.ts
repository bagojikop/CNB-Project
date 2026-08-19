import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-batch-status',
  imports: [CommonModule],
  templateUrl: './batch-status.component.html',
  styleUrl: './batch-status.component.scss',
})
export class BatchStatusComponent {
  // After Checker Approval - APPROVED batch data
  batchData: CanaraBatchStatusResponse = {
    Response: {
      status: {
        message: {
          code: '0',
          type: 'INFO',
        },
        result: 'SUCCESSFUL',
      },
      body: {
        encryptData: {
          batchRequestId: 'BATCH230420250002',
          batchStatus: 'APPROVED',
          TotAmt: '1000200',
          TxnCnt: '3',
          Initiated_By: '57510379M',
          Initiated_Date: '23/04/2025 13:39:03',
          Approved_By: '57510379C',
          Approved_Date: '23/04/2025 13:47:47',
          bulkResponse: {
            bulkRefDet: [
              {
                amount: '100',
                creditAccountId: '24201517683',
                debitAccountId: '0402256027830',
                externalReferenceId: 'P113250238939441',
                ifscCode: 'ICIC0000242',
                recRefId: '814735742304000002',
                status: 'COMPLETED',
                systemReferenceId: 'PC8793180439554',
                txnRefNo: 'TRAN2304202500011',
                TxnType: 'NEFT',
                txnType: 'N06',
                Benename: 'Gaurav Mangale',
                Nrtv: 'REMITTANCE TO MR X',
                trnsStatus: '20- In Progress',
                reason: '',
              },
              {
                amount: '1000000',
                creditAccountId: '24201517683',
                debitAccountId: '0402256027830',
                externalReferenceId: 'CNRBR52025042354861064',
                ifscCode: 'ICIC0000242',
                recRefId: '814735742304000003',
                status: 'COMPLETED',
                systemReferenceId: 'PC440c360850651',
                txnRefNo: 'TRAN2304202500012',
                TxnType: 'RTGS',
                txnType: 'R41',
                Benename: 'Ajit Bkop',
                Nrtv: 'REMITTANCE TO MR X',
                trnsStatus: '20- In Progress',
                reason: '',
              },
              {
                amount: '100',
                creditAccountId: '6038111000017',
                debitAccountId: '0402256027830',
                externalReferenceId: 'PC09758d0223885',
                ifscCode: 'CNRB0000693',
                recRefId: '814735742304000004',
                status: 'COMPLETED',
                systemReferenceId: 'PC09758d0223885',
                txnRefNo: 'TRAN2304202500013',
                TxnType: 'INTERNAL_TRANSFER',
                txnType: 'INT',
                Benename: 'Rashid Nadaf',
                Nrtv: 'REMITTANCE TO MR X',
                trnsStatus: 'COMPLETED',
                reason: '',
              },
            ],
          },
        },
      },
    },
  };

  get transactions(): CanaraTransactionDetail[] {
    return this.batchData.Response.body.encryptData.bulkResponse.bulkRefDet;
  }

  // Pagination properties and methods
  currentPage: number = 1;
  itemsPerPage: number = 5;

  get paginatedTransactions(): CanaraTransactionDetail[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.transactions.slice(start, end);
  }

  get totalItems(): number {
    return this.transactions.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get startIndex(): number {
    return this.totalItems === 0
      ? 0
      : (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.totalItems);
  }

  get visiblePages(): (number | -1)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | -1)[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) {
        pages.push(-1);
      }
      const startPage = Math.max(2, current - 1);
      const endPage = Math.min(total - 1, current + 1);
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (current < total - 2) {
        pages.push(-1);
      }
      pages.push(total);
    }
    return pages;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
