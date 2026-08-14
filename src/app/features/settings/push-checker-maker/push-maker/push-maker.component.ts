import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {} from '@coreui/angular-pro';
import { IconDirective } from '@coreui/icons-angular';
import {
  EncryptData,
  Transaction,
} from '@shared-interfaces/settings/push-checker-maker/push-maker';

@Component({
  selector: 'app-pay-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './push-maker.component.html',
  styleUrl: './push-maker.component.scss',
})
export class pushMakerComponent {
  // Sample data with multiple batch request IDs
  batchList: EncryptData[] = [
    {
      Authorization: 'AUTH123456',
      Key: 'KEY987654',
      CustomerID: 'CUST001',
      TotAmt: '25000.00',
      TxnCnt: '3',
      DatTxn: '2026-08-12',
      ExternalReferenceno: 'EXT-REF-2026-001',
      BatchRequestID: 'BATCH-2026-001',
      TxnDtls: {
        Txn: [
          {
            TxnRefNo: 'TXN001',
            DrAcct: '1234567890',
            SndrNm: 'John Doe',
            TxnAmt: '10000.00',
            TxnType: 'NEFT',
            BenefIFSC: 'SBIN0001234',
            BenefAcNo: '9876543210',
            BenefAcNm: 'Jane Smith',
            Nrtv: 'Payment for invoice #001',
          },
          {
            TxnRefNo: 'TXN002',
            DrAcct: '1234567891',
            SndrNm: 'Alice Johnson',
            TxnAmt: '8000.00',
            TxnType: 'RTGS',
            BenefIFSC: 'HDFC0005678',
            BenefAcNo: '8765432109',
            BenefAcNm: 'Bob Williams',
            Nrtv: 'Payment for invoice #002',
          },
          {
            TxnRefNo: 'TXN003',
            DrAcct: '1234567892',
            SndrNm: 'Charlie Brown',
            TxnAmt: '7000.00',
            TxnType: 'IMPS',
            BenefIFSC: 'ICIC0009012',
            BenefAcNo: '7654321098',
            BenefAcNm: 'Diana Miller',
            Nrtv: 'Payment for invoice #003',
          },
        ],
      },
    },
    {
      Authorization: 'AUTH789012',
      Key: 'KEY345678',
      CustomerID: 'CUST002',
      TotAmt: '15000.00',
      TxnCnt: '2',
      DatTxn: '2026-08-13',
      ExternalReferenceno: 'EXT-REF-2026-002',
      BatchRequestID: 'BATCH-2026-002',
      TxnDtls: {
        Txn: [
          {
            TxnRefNo: 'TXN004',
            DrAcct: '1234567893',
            SndrNm: 'David Wilson',
            TxnAmt: '9000.00',
            TxnType: 'NEFT',
            BenefIFSC: 'SBIN0005678',
            BenefAcNo: '6543210987',
            BenefAcNm: 'Emma Davis',
            Nrtv: 'Payment for invoice #004',
          },
          {
            TxnRefNo: 'TXN005',
            DrAcct: '1234567894',
            SndrNm: 'Frank Thomas',
            TxnAmt: '6000.00',
            TxnType: 'RTGS',
            BenefIFSC: 'HDFC0009012',
            BenefAcNo: '5432109876',
            BenefAcNm: 'Grace Martinez',
            Nrtv: 'Payment for invoice #005',
          },
        ],
      },
    },
    {
      Authorization: 'AUTH345678',
      Key: 'KEY901234',
      CustomerID: 'CUST003',
      TotAmt: '12000.00',
      TxnCnt: '2',
      DatTxn: '2026-08-14',
      ExternalReferenceno: 'EXT-REF-2026-003',
      BatchRequestID: 'BATCH-2026-003',
      TxnDtls: {
        Txn: [
          {
            TxnRefNo: 'TXN006',
            DrAcct: '1234567895',
            SndrNm: 'Henry Anderson',
            TxnAmt: '5000.00',
            TxnType: 'IMPS',
            BenefIFSC: 'ICIC0003456',
            BenefAcNo: '4321098765',
            BenefAcNm: 'Ivy Thompson',
            Nrtv: 'Payment for invoice #006',
          },
          {
            TxnRefNo: 'TXN007',
            DrAcct: '1234567896',
            SndrNm: 'Jack White',
            TxnAmt: '7000.00',
            TxnType: 'NEFT',
            BenefIFSC: 'SBIN0007890',
            BenefAcNo: '3210987654',
            BenefAcNm: 'Karen Harris',
            Nrtv: 'Payment for invoice #007',
          },
        ],
      },
    },
  ];

  selectedBatchIndex = 0;

  get batchData(): EncryptData {
    return this.batchList[this.selectedBatchIndex];
  }

  get transactions(): Transaction[] {
    return this.batchData.TxnDtls.Txn;
  }

  selectedTransactions: boolean[] = this.transactions.map(() => false);
  showTransactionModal = false;
  selectedTransaction: Transaction | null = null;

  selectBatch(index: number): void {
    this.selectedBatchIndex = index;
    this.selectedTransactions = this.transactions.map(() => false);
    this.selectedTransaction = null;
  }

  getSelectedCount(): number {
    return this.selectedTransactions.filter((selected) => selected).length;
  }

  getTotalAmount(): number {
    return this.transactions.reduce(
      (sum, txn) => sum + parseFloat(txn.TxnAmt || '0'),
      0,
    );
  }

  getSelectedAmount(): number {
    let total = 0;
    this.transactions.forEach((txn, index) => {
      if (this.selectedTransactions[index]) {
        total += parseFloat(txn.TxnAmt || '0');
      }
    });
    return total;
  }

  hasSelectedTransactions(): boolean {
    return this.selectedTransactions.some((selected) => selected);
  }

  isAllSelected(): boolean {
    return (
      this.transactions.length > 0 &&
      this.selectedTransactions.every((selected) => selected)
    );
  }

  toggleAllCheckboxes(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedTransactions = this.selectedTransactions.map(() => checked);
  }

  toggleTransactionSelection(index: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedTransactions[index] = checked;
  }

  acceptSelectedTransactions(): void {
    const selectedIndices = this.selectedTransactions
      .map((selected, index) => (selected ? index : -1))
      .filter((index) => index !== -1);

    if (selectedIndices.length === 0) {
      return;
    }

    // Remove selected transactions (in reverse order to avoid index issues)
    selectedIndices.sort((a, b) => b - a);
    selectedIndices.forEach((index) => {
      this.transactions.splice(index, 1);
      this.selectedTransactions.splice(index, 1);
    });

    // Update batch data
    this.batchData.TxnCnt = String(this.transactions.length);
    this.batchData.TotAmt = String(this.getTotalAmount());
  }

  removeTransaction(index: number): void {
    if (this.transactions.length <= 1) {
      return;
    }
    this.transactions.splice(index, 1);
    this.selectedTransactions.splice(index, 1);
    this.batchData.TxnCnt = String(this.transactions.length);
    this.batchData.TotAmt = String(this.getTotalAmount());
  }

  viewTransactionDetails(index: number): void {
    this.selectedTransaction = this.transactions[index];
    this.showTransactionModal = true;
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.selectedTransaction = null;
  }

  // Getter to access batchData properties in template
  getBatchRequestId(): string {
    return this.batchData.BatchRequestID;
  }

  getAuthorization(): string {
    return this.batchData.Authorization;
  }

  getCustomerId(): string {
    return this.batchData.CustomerID;
  }

  getTotAmt(): string {
    return this.batchData.TotAmt;
  }

  getDatTxn(): string {
    return this.batchData.DatTxn;
  }

  // Batch selection methods
  selectedBatches: boolean[] = this.batchList.map(() => false);
  showBatchModal = false;
  selectedBatchForModal: EncryptData | null = null;

  getSelectedBatchCount(): number {
    return this.selectedBatches.filter((selected) => selected).length;
  }

  hasAnyBatchSelected(): boolean {
    return this.selectedBatches.some((selected) => selected);
  }

  isAllBatchesSelected(): boolean {
    return (
      this.batchList.length > 0 &&
      this.selectedBatches.every((selected) => selected)
    );
  }

  toggleAllBatches(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedBatches = this.selectedBatches.map(() => checked);
  }

  toggleBatchSelection(index: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedBatches[index] = checked;
  }

  viewBatchTransactions(index: number): void {
    this.selectedBatchForModal = this.batchList[index];
    this.showBatchModal = true;
  }

  closeBatchModal(): void {
    this.showBatchModal = false;
    this.selectedBatchForModal = null;
  }

  acceptSelectedBatch(): void {
    if (this.selectedBatchForModal === null) {
      return;
    }
    // Remove the batch from the list
    const index = this.batchList.indexOf(this.selectedBatchForModal);
    if (index !== -1) {
      this.batchList.splice(index, 1);
      this.selectedBatches.splice(index, 1);
      if (this.selectedBatchIndex >= this.batchList.length) {
        this.selectedBatchIndex = this.batchList.length - 1;
      }
      this.closeBatchModal();
    }
  }

  removeBatch(index: number): void {
    if (this.batchList.length <= 1) {
      return;
    }
    this.batchList.splice(index, 1);
    this.selectedBatches.splice(index, 1);
    if (this.selectedBatchIndex >= this.batchList.length) {
      this.selectedBatchIndex = this.batchList.length - 1;
    }
  }

  acceptAllBatches(): void {
    // Remove all selected batches
    const selectedIndices = this.selectedBatches
      .map((selected, index) => (selected ? index : -1))
      .filter((index) => index !== -1);

    if (selectedIndices.length === 0) {
      return;
    }

    selectedIndices.sort((a, b) => b - a);
    selectedIndices.forEach((index) => {
      this.batchList.splice(index, 1);
      this.selectedBatches.splice(index, 1);
    });

    if (this.selectedBatchIndex >= this.batchList.length) {
      this.selectedBatchIndex = this.batchList.length - 1;
    }
  }

  getGrandTotalAmount(): number {
    return this.batchList.reduce(
      (sum, batch) => sum + parseFloat(batch.TotAmt || '0'),
      0,
    );
  }

  // Pagination properties and methods
  currentPage: number = 1;
  itemsPerPage: number = 3;

  get paginatedBatchList(): EncryptData[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.batchList.slice(start, end);
  }

  get totalItems(): number {
    return this.batchList.length;
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
