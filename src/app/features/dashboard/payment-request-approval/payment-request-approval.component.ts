import { Component, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  approvalData: any[] = [
    {
      id: 1,
      batchId: 'BATCH-20260730-001',
      paymentType: 'Single',
      totalAmount: 12500,
      partyName: 'Shree Traders',
      paymentAgainst: 'Purchase Invoice INV-1001',
      requestDate: '2026-07-30',
      status: 'Pending',
      bankName: 'State Bank of India',
      accountNo: 'XXXXXX4521',
      requestedBy: 'Rahul Sharma',
      bulkItems: [],
    },
    {
      id: 2,
      batchId: 'BATCH-20260730-002',
      paymentType: 'Bulk',
      totalAmount: 98500,
      partyName: 'Mahalaxmi Agro Pvt Ltd',
      paymentAgainst: 'Salary Processing July 2026',
      requestDate: '2026-07-29',
      status: 'Pending',
      bankName: 'HDFC Bank',
      accountNo: 'XXXXXX7788',
      requestedBy: 'Priya Patel',
      bulkItems: [
        {
          id: 101,
          employeeName: 'Rajesh Kumar',
          amount: 25000,
          account: 'XXXXXX1234',
          status: 'Pending',
        },
        {
          id: 102,
          employeeName: 'Sneha Patel',
          amount: 22000,
          account: 'XXXXXX5678',
          status: 'Pending',
        },
        {
          id: 103,
          employeeName: 'Amit Singh',
          amount: 18000,
          account: 'XXXXXX9012',
          status: 'Pending',
        },
        {
          id: 104,
          employeeName: 'Priya Sharma',
          amount: 33500,
          account: 'XXXXXX3456',
          status: 'Pending',
        },
      ],
    },
    {
      id: 3,
      batchId: 'BATCH-20260730-003',
      paymentType: 'Single',
      totalAmount: 45000,
      partyName: 'Anand Agencies',
      paymentAgainst: 'Service Charges Invoice SC-220',
      requestDate: '2026-07-28',
      status: 'Pending',
      bankName: 'ICICI Bank',
      accountNo: 'XXXXXX1122',
      requestedBy: 'Amit Kumar',
      bulkItems: [],
    },
    {
      id: 4,
      batchId: 'BATCH-20260730-004',
      paymentType: 'Bulk',
      totalAmount: 150000,
      partyName: 'Bhumata Farmers Group',
      paymentAgainst: 'Farmer Incentive Distribution',
      requestDate: '2026-07-27',
      status: 'Pending',
      bankName: 'Bank of Maharashtra',
      accountNo: 'XXXXXX9981',
      requestedBy: 'Sneha Reddy',
      bulkItems: [
        {
          id: 201,
          farmerName: 'Ganesh Patil',
          amount: 30000,
          account: 'XXXXXX1111',
          status: 'Pending',
        },
        {
          id: 202,
          farmerName: 'Mohan Jadhav',
          amount: 25000,
          account: 'XXXXXX2222',
          status: 'Pending',
        },
        {
          id: 203,
          farmerName: 'Suresh Deshmukh',
          amount: 45000,
          account: 'XXXXXX3333',
          status: 'Pending',
        },
        {
          id: 204,
          farmerName: 'Ramesh Shinde',
          amount: 50000,
          account: 'XXXXXX4444',
          status: 'Pending',
        },
      ],
    },
    {
      id: 5,
      batchId: 'BATCH-20260730-005',
      paymentType: 'Single',
      totalAmount: 32000,
      partyName: 'Ganesh Suppliers',
      paymentAgainst: 'Raw Material Invoice RM-567',
      requestDate: '2026-07-26',
      status: 'Pending',
      bankName: 'Axis Bank',
      accountNo: 'XXXXXX6655',
      requestedBy: 'Vikram Singh',
      bulkItems: [],
    },
  ];

  selectedItem: any = null;
  showDetails = false;
  selectedBulkItems: Set<number> = new Set();
  selectAllBulk = false;
  dropdownRef: any = null;

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

  getPendingCount(): number {
    return this.approvalData.filter((x) => x.status === 'Pending').length;
  }

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

  // Dropdown toggle methods
  toggleDropdown(dropdown: any): void {
    dropdown.isOpen = !dropdown.isOpen;
    // Close other dropdowns if needed
    if (dropdown.isOpen) {
      document.querySelectorAll('.dropdown-menu.show').forEach((el) => {
        if (el !== dropdown.querySelector('.dropdown-menu')) {
          el.classList.remove('show');
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
}
