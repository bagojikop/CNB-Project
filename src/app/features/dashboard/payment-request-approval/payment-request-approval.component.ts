import { Component, inject } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import data from '@assets/data/paymentRqstApproval.json';
export interface SinglePaymentAPI {
  Request: {
    body: {
      encryptData: SinglePayment;
    };
  };
}

export interface SinglePayment {
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

@Component({
  selector: 'app-payment-request-approval',
  imports: [NgClass, CurrencyPipe, CommonModule, FormsModule],
  templateUrl: './payment-request-approval.component.html',
  styleUrl: './payment-request-approval.component.scss',
})
export class PaymentRequestApprovalComponent {
  // Filter and pagination properties
  selectedPaymentType: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 3;
  private router = inject(Router);
  constructor() {
    this.selectedPaymentType =
      this.router.url ==
      '/dashboard/dashboard-form/singal-payment-request-Approval'
        ? 'single'
        : 'bulk';
  }

  approvalData: any[] = data;

  selectedItem: any = null;
  showDetails = false;
  selectedBulkItems: Set<number> = new Set();
  selectedSingleItems: Set<number> = new Set();
  selectAllBulk = false;
  dropdownRef: any = null;

  // Computed property for Select All checkbox
  get allSelected(): boolean {
    const pendingItems = this.paginatedData.filter(
      (item) =>
        item.status !== 'Approved' &&
        item.paymentType.toLowerCase() === 'single',
    );
    if (pendingItems.length === 0) return false;
    return pendingItems.every((item) => this.selectedSingleItems.has(item.id));
  }

  toggleAllSelections(event: any): void {
    const checked = event.target.checked;
    const pendingItems = this.paginatedData.filter(
      (item) =>
        item.status !== 'Approved' &&
        item.paymentType.toLowerCase() === 'single',
    );
    if (checked) {
      pendingItems.forEach((item) => this.selectedSingleItems.add(item.id));
    } else {
      pendingItems.forEach((item) => this.selectedSingleItems.delete(item.id));
    }
  }

  onShow(item: any) {
    // Only show details for Bulk payments
    if (item.paymentType === 'Bulk') {
      this.selectedItem = item;
      this.selectedBulkItems = new Set();
      this.selectAllBulk = false;
      this.showDetails = true;
    }
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedItem = null;
    this.selectedBulkItems.clear();
    this.selectAllBulk = false;
  }

  toggleBulkSelection(itemId: number) {
    if (this.selectedBulkItems.has(itemId)) {
      this.selectedBulkItems.delete(itemId);
    } else {
      this.selectedBulkItems.add(itemId);
    }
    this.updateSelectAllState();
  }

  toggleSelectAll(event: any) {
    if (this.selectAllBulk) {
      this.selectedItem.bulkItems.forEach((item: any) => {
        this.selectedBulkItems.add(item.id);
      });
    } else {
      this.selectedBulkItems.clear();
    }
  }

  updateSelectAllState() {
    if (this.selectedItem && this.selectedItem.bulkItems) {
      this.selectAllBulk = this.selectedItem.bulkItems.every((item: any) =>
        this.selectedBulkItems.has(item.id),
      );
    }
  }

  approveSelectedBulk() {
    if (this.selectedItem && this.selectedItem.bulkItems) {
      this.selectedItem.bulkItems.forEach((item: any) => {
        if (this.selectedBulkItems.has(item.id)) {
          item.status = 'Approved';
        }
      });
      // Update main status if all items are approved
      const allApproved = this.selectedItem.bulkItems.every(
        (item: any) => item.status === 'Approved',
      );
      if (allApproved) {
        this.selectedItem.status = 'Approved';
      }
      this.selectedBulkItems.clear();
      this.selectAllBulk = false;
      // Update in main array
      const index = this.approvalData.findIndex(
        (d) => d.id === this.selectedItem.id,
      );
      if (index !== -1) {
        this.approvalData[index] = { ...this.selectedItem };
      }
      console.log('Bulk items approved:', this.selectedItem.bulkItems);
    }
  }

  // Get filtered data based on selected payment type
  get filteredData(): any[] {
    if (this.selectedPaymentType === 'all') {
      return this.approvalData;
    }
    return this.approvalData.filter(
      (item) =>
        item.paymentType.toLowerCase() ===
        this.selectedPaymentType.toLowerCase(),
    );
  }

  // Get total pages
  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.itemsPerPage);
  }

  // Get paginated data for current page
  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredData.slice(startIndex, endIndex);
  }

  // Change page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Previous page
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Handle payment type filter change
  onPaymentTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedPaymentType = select.value;
    this.currentPage = 1; // Reset to first page when filter changes
  }

  // getPendingCount(): number {
  //   return this.approvalData.filter((x) => x.status === 'Pending').length;
  // }

  approveSinglePayment(item: any) {
    // Build the SinglePaymentAPI request payload
    const singlePaymentRequest: SinglePaymentAPI = {
      Request: {
        body: {
          encryptData: {
            Authorization: item.authorization || 'AUTH123456',
            key: item.key || 'KEY789012',
            customerID: item.customerID || 'CUST001',
            srcAcctNumber: item.srcAcctNumber || '1234567890',
            txnPassword: item.txnPassword || '******',
            branchCode: item.branchCode || 'BR001',
            destAcctNumber: item.destAcctNumber || '0987654321',
            ifscCode: item.ifscCode || 'SBIN0001234',
            txnAmount: item.totalAmount?.toString() || '0',
            benefName: item.partyName || 'Beneficiary',
            userRefNo: item.userRefNo || item.batchId || 'REF001',
            narration: item.narration || item.paymentAgainst || 'Payment',
            valueDate:
              item.valueDate ||
              item.requestDate ||
              new Date().toISOString().split('T')[0],
            TrnType: item.TrnType || 'SINGLE',
          },
        },
      },
    };

    // Log the request for debugging
    console.log(
      'Approving Single Payment Request:',
      JSON.stringify(singlePaymentRequest, null, 2),
    );

    // Simulate API call
    const index = this.approvalData.findIndex((d) => d.id === item.id);
    if (index !== -1) {
      this.approvalData[index].status = 'Approved';
      console.log('Payment Approved:', item);
    }
    this.closeDetails();
  }

  rejectSinglePayment(item: any) {
    // Build the SinglePaymentAPI request payload for rejection
    const singlePaymentRequest: SinglePaymentAPI = {
      Request: {
        body: {
          encryptData: {
            Authorization: item.authorization || 'AUTH123456',
            key: item.key || 'KEY789012',
            customerID: item.customerID || 'CUST001',
            srcAcctNumber: item.srcAcctNumber || '1234567890',
            txnPassword: item.txnPassword || '******',
            branchCode: item.branchCode || 'BR001',
            destAcctNumber: item.destAcctNumber || '0987654321',
            ifscCode: item.ifscCode || 'SBIN0001234',
            txnAmount: item.totalAmount?.toString() || '0',
            benefName: item.partyName || 'Beneficiary',
            userRefNo: item.userRefNo || item.batchId || 'REF001',
            narration: `REJECTED: ${item.narration || item.paymentAgainst || 'Payment'}`,
            valueDate:
              item.valueDate ||
              item.requestDate ||
              new Date().toISOString().split('T')[0],
            TrnType: item.TrnType || 'SINGLE',
          },
        },
      },
    };

    // Log the request for debugging
    console.log(
      'Rejecting Single Payment Request:',
      JSON.stringify(singlePaymentRequest, null, 2),
    );

    const index = this.approvalData.findIndex((d) => d.id === item.id);
    if (index !== -1) {
      this.approvalData[index].status = 'Rejected';
      console.log('Payment Rejected:', item);
    }
    this.closeDetails();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved':
        return 'badge bg-success';
      case 'Rejected':
        return 'badge bg-danger';
      default:
        return 'badge bg-warning';
    }
  }

  getSelectedCount(): number {
    return this.selectedBulkItems.size;
  }

  isBulkSelected(itemId: number): boolean {
    return this.selectedBulkItems.has(itemId);
  }

  isApproveAllDisabled(selectedItem: any): boolean {
    return (
      selectedItem?.paymentType === 'Bulk' &&
      selectedItem?.bulkItems?.some((item: any) => item.status !== 'Approved')
    );
  }

  handleClickOutside(dropdown: any, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdownElement =
      dropdown._elementRef?.nativeElement || dropdown.parentElement;
    if (dropdownElement && !dropdownElement.contains(target)) {
      this.closeDropdown(dropdown);
      document.removeEventListener(
        'click',
        this.handleClickOutside.bind(this, dropdown),
      );
    }
  }

  toggleDropdown(dropdown: any): void {
    dropdown.isOpen = !dropdown.isOpen;
    if (dropdown.isOpen) {
      // Close other dropdowns
      const allDropdowns = document.querySelectorAll('.dropdown');
      allDropdowns.forEach((d: any) => {
        if (d !== dropdown && d.isOpen) {
          d.isOpen = false;
        }
      });
      // Add click outside listener
      setTimeout(() => {
        document.addEventListener(
          'click',
          this.handleClickOutside.bind(this, dropdown),
        );
      }, 0);
    } else {
      document.removeEventListener(
        'click',
        this.handleClickOutside.bind(this, dropdown),
      );
    }
  }

  closeDropdown(dropdown: any): void {
    dropdown.isOpen = false;
    document.removeEventListener(
      'click',
      this.handleClickOutside.bind(this, dropdown),
    );
  }

  holdSinglePayment(item: any): void {
    // Build the SinglePaymentAPI request payload for hold
    const singlePaymentRequest: SinglePaymentAPI = {
      Request: {
        body: {
          encryptData: {
            Authorization: item.authorization || 'AUTH123456',
            key: item.key || 'KEY789012',
            customerID: item.customerID || 'CUST001',
            srcAcctNumber: item.srcAcctNumber || '1234567890',
            txnPassword: item.txnPassword || '******',
            branchCode: item.branchCode || 'BR001',
            destAcctNumber: item.destAcctNumber || '0987654321',
            ifscCode: item.ifscCode || 'SBIN0001234',
            txnAmount: item.totalAmount?.toString() || '0',
            benefName: item.partyName || 'Beneficiary',
            userRefNo: item.userRefNo || item.batchId || 'REF001',
            narration: `HOLD: ${item.narration || item.paymentAgainst || 'Payment'}`,
            valueDate:
              item.valueDate ||
              item.requestDate ||
              new Date().toISOString().split('T')[0],
            TrnType: item.TrnType || 'SINGLE',
          },
        },
      },
    };

    // Log the request for debugging
    console.log(
      'Holding Single Payment Request:',
      JSON.stringify(singlePaymentRequest, null, 2),
    );

    const index = this.approvalData.findIndex((d) => d.id === item.id);
    if (index !== -1) {
      this.approvalData[index].status = 'Hold';
      console.log('Payment Held:', item);
    }
    this.closeDropdown(this.dropdownRef);
  }

  // Single payment selection methods
  isSingleSelected(itemId: number): boolean {
    return this.selectedSingleItems.has(itemId);
  }

  toggleSingleSelection(itemId: number): void {
    if (this.selectedSingleItems.has(itemId)) {
      this.selectedSingleItems.delete(itemId);
    } else {
      this.selectedSingleItems.add(itemId);
    }
  }

  pushSelectedItems(): void {
    const selectedIds = Array.from(this.selectedSingleItems);
    if (selectedIds.length === 0) {
      alert('Please select at least one payment request to push.');
      return;
    }

    // Find the selected items from approvalData
    const selectedItems = this.approvalData.filter(
      (item) =>
        selectedIds.includes(item.id) &&
        item.paymentType.toLowerCase() === 'single',
    );

    if (selectedItems.length === 0) {
      alert('No valid single payment requests selected.');
      return;
    }

    // Loop through each selected item and call approveSinglePayment
    selectedItems.forEach((item) => {
      this.approveSinglePayment(item);
      // Set status to 'Approved' for each selected single payment
      const index = this.approvalData.findIndex((d) => d.id === item.id);
      if (index !== -1) {
        this.approvalData[index].status = 'Approved';
      }
    });

    // Clear selection after push
    this.selectedSingleItems.clear();

    // Show success message
    alert(`Successfully pushed ${selectedItems.length} payment request(s).`);
  }
}
