import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {} from '@coreui/angular-pro';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';

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

@Component({
  selector: 'app-batch-inquiry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DSS_FORM_CONTROLS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './batch-inquiry.component.html',
  styleUrl: './batch-inquiry.component.scss',
})
export class BatchInquiryComponent {
  // Search form
  searchForm: FormGroup;

  // Table data
  batchData: BatchInquiryData[] = [];
  selectedBatch: BatchInquiryData | null = null;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 3;
  get totalItems(): number {
    return this.batchData[0]?.TxnDtls?.Txn?.length || 0;
  }

  // Loading state
  isLoading = false;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      authorization: [''],
      customerId: [''],
      batchRequestId: [''],
      txnRefNo: [''],
    });

    // Initialize with sample data
    this.batchData = [...this.sampleData];
  }

  // Get paginated transactions for the current batch
  get paginatedTransactions(): BatchInquiryTransaction[] {
    const transactions = this.batchData[0]?.TxnDtls?.Txn || [];
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return transactions.slice(start, end);
  }

  // Get total pages
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  // Change page
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  // Get visible page numbers
  get visiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, total);
      } else if (current >= total - 2) {
        pages.push(1, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, current - 1, current, current + 1, total);
      }
    }
    return pages;
  }

  private sampleData: BatchInquiryData[] = [
    {
      UserName: '57510379M',
      CustomerID: '57510379',
      TotAmt: '200300.00',
      TxnCnt: '4',
      DatTxn: '20250623',
      BatchRequestID: '2BATCHAPI001',
      TxnRefNo: '',
      TotNeftAmt: '100.0',
      TxnNeftCnt: '1',
      TotRtgsAmt: '200000.0',
      TxnRtgsCnt: '1',
      TotImpsAmt: '100.0',
      TxnImpsCnt: '1',
      TotIntraAmt: '100.0',
      TxnIntraCnt: '1',
      TxnDtls: {
        Txn: [
          {
            TxnRefNo: 'T2BATCH20250623001',
            DrAcct: '0402256027830',
            SndrNm: 'SENDERNAME',
            TxnAmt: '100.00',
            TxnType: 'NEFT',
            BenefIFSC: 'ICIC0000598',
            BenefAcNo: '05980151858585',
            BenefAcNm: 'BENEFICIARYNAME',
            Nrtv: 'REMITTANCETOMRX',
            utr_RRN_Number: 'P174250238976177',
            TxnStatus: 'Successful',
            Txn_init_date: '20250623112533',
            Approved_By: '57510379C',
            Approved_Date: '20250623112857',
          },
          {
            TxnRefNo: 'T2BATCH20250623002',
            DrAcct: '0402256027830',
            SndrNm: 'SENDERNAME',
            TxnAmt: '200000.00',
            TxnType: 'RTGS',
            BenefIFSC: 'ICIC0000598',
            BenefAcNo: '05980151858585',
            BenefAcNm: 'BENEFICIARYNAME',
            Nrtv: 'REMITTANCETOMRX',
            utr_RRN_Number: 'CNRBR52025062354864071',
            TxnStatus: 'Successful',
            Txn_init_date: '20250623112533',
            Approved_By: '57510379C',
            Approved_Date: '20250623112900',
          },
          {
            TxnRefNo: 'T2BATCH20250623003',
            DrAcct: '0402256027830',
            SndrNm: 'SENDERNAME',
            TxnAmt: '100.00',
            TxnType: 'INTRA',
            BenefAcNo: '6038111000017',
            BenefAcNm: 'BENEFICIARYNAME',
            Nrtv: 'REMITTANCETOMRX',
            utr_RRN_Number: 'T2BATCH20250623003',
            TxnStatus: 'Successful',
            Txn_init_date: '20250623112534',
            Approved_By: '57510379C',
            Approved_Date: '20250623112854',
          },
          {
            TxnRefNo: 'T2BATCH20250623004',
            DrAcct: '0402256027830',
            SndrNm: 'SENDERNAME',
            TxnAmt: '100.00',
            TxnType: 'NEFT',
            BenefIFSC: 'ICIC0000598',
            BenefAcNo: '05980151858585',
            BenefAcNm: 'BENEFICIARYNAME',
            Nrtv: 'REMITTANCETOMRX',
            TxnStatus: 'Rejected',
            Txn_init_date: '20250623112534',
            Approved_By: '57510379C',
            Approved_Date: '20250623112945',
          },
        ],
      },
    },
  ];

  // Sample data for demonstration

  // Selected rows for batch operations
  selectedRows: Set<number> = new Set();

  // Sort configuration
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Search/Filter method
  onSearch(): void {
    this.isLoading = true;

    const formValue = this.searchForm.value;

    // Simulate API call with filtering
    setTimeout(() => {
      let filtered = [...this.sampleData];

      if (formValue.authorization) {
        filtered = filtered.filter((item) =>
          item.UserName.toLowerCase().includes(
            formValue.authorization.toLowerCase(),
          ),
        );
      }
      if (formValue.customerId) {
        filtered = filtered.filter((item) =>
          item.CustomerID.toLowerCase().includes(
            formValue.customerId.toLowerCase(),
          ),
        );
      }
      if (formValue.batchRequestId) {
        filtered = filtered.filter((item) =>
          item.BatchRequestID.toLowerCase().includes(
            formValue.batchRequestId.toLowerCase(),
          ),
        );
      }
      if (formValue.txnRefNo) {
        filtered = filtered.filter((item) =>
          item.TxnRefNo.toLowerCase().includes(
            formValue.txnRefNo.toLowerCase(),
          ),
        );
      }

      this.batchData = filtered;
      this.isLoading = false;
      this.selectedRows.clear();
    }, 500);
  }

  // Reset search form
  onReset(): void {
    this.searchForm.reset({
      authorization: '',
      customerId: '',
      batchRequestId: '',
      txnRefNo: '',
    });
    this.batchData = [...this.sampleData];
    this.selectedRows.clear();
  }

  // Toggle row selection
  toggleRowSelection(index: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedRows.add(index);
    } else {
      this.selectedRows.delete(index);
    }
  }

  // Toggle all rows selection
  toggleAllRows(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.batchData.forEach((_, index) => this.selectedRows.add(index));
    } else {
      this.selectedRows.clear();
    }
  }

  // Check if all rows are selected
  isAllSelected(): boolean {
    return (
      this.batchData.length > 0 &&
      this.selectedRows.size === this.batchData.length
    );
  }

  // Get selected count
  getSelectedCount(): number {
    return this.selectedRows.size;
  }

  // Get total amount of selected rows
  getSelectedTotal(): number {
    let total = 0;
    this.selectedRows.forEach((index) => {
      total += parseFloat(this.batchData[index]?.TotAmt || '0');
    });
    return total;
  }

  // Sort table
  sortData(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.batchData.sort((a, b) => {
      const aVal = a[column as keyof BatchInquiryData];
      const bVal = b[column as keyof BatchInquiryData];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return this.sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return this.sortDirection === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }

  // Get status badge color
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'approved':
        return 'info';
      case 'verified':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      case 'error':
        return 'danger';
      case 'expired':
        return 'secondary';
      case 'processed':
        return 'info';
      default:
        return 'secondary';
    }
  }

  // View batch details
  viewBatchDetails(batch: BatchInquiryData): void {
    this.selectedBatch = batch;
    console.log('View batch details:', batch);
  }

  // Get total transactions count
  getTotalTransactions(batch: BatchInquiryData): number {
    return batch.TxnDtls?.Txn?.length || 0;
  }

  // Get transaction status counts
  getStatusCount(batch: BatchInquiryData, status: string): number {
    if (!batch.TxnDtls?.Txn) return 0;
    return batch.TxnDtls.Txn.filter((t) => t.TxnStatus === status).length;
  }
}
