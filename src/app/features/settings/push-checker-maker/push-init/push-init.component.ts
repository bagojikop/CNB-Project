import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';

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

@Component({
  selector: 'app-push-init',
  imports: [CommonModule, DSS_FORM_CONTROLS],
  templateUrl: './push-init.component.html',
  styleUrl: './push-init.component.scss',
})
export class PushInitComponent {
  // All batch records
  allBatchList: any[] = [
    {
      id: 1,
      batchName: 'Salary Processing - July 2026',
      batchId: 'BATCH-20260730-001',
      totalAmount: 125000,
      totalItems: 45,
      status: 'Pending',
      createdDate: '2026-07-30',
      createdBy: 'Rahul Sharma',
    },
    {
      id: 2,
      batchName: 'Vendor Payments - Q2 2026',
      batchId: 'BATCH-20260729-002',
      totalAmount: 450000,
      totalItems: 78,
      status: 'Initiated',
      createdDate: '2026-07-29',
      createdBy: 'Priya Patel',
    },
    {
      id: 3,
      batchName: 'Farmer Incentive Distribution',
      batchId: 'BATCH-20260728-003',
      totalAmount: 150000,
      totalItems: 23,
      status: 'Pending',
      createdDate: '2026-07-28',
      createdBy: 'Sneha Reddy',
    },
    {
      id: 4,
      batchName: 'Monthly Utility Bills',
      batchId: 'BATCH-20260727-004',
      totalAmount: 85000,
      totalItems: 12,
      status: 'Completed',
      createdDate: '2026-07-27',
      createdBy: 'Amit Kumar',
    },
    {
      id: 5,
      batchName: 'Employee Reimbursements',
      batchId: 'BATCH-20260726-005',
      totalAmount: 32000,
      totalItems: 8,
      status: 'Pending',
      createdDate: '2026-07-26',
      createdBy: 'Vikram Singh',
    },
    {
      id: 6,
      batchName: 'Supplier Payments - Q3 2026',
      batchId: 'BATCH-20260725-006',
      totalAmount: 280000,
      totalItems: 34,
      status: 'Pending',
      createdDate: '2026-07-25',
      createdBy: 'Deepak Gupta',
    },
    {
      id: 7,
      batchName: 'Dividend Distribution',
      batchId: 'BATCH-20260724-007',
      totalAmount: 75000,
      totalItems: 15,
      status: 'Initiated',
      createdDate: '2026-07-24',
      createdBy: 'Suman Joshi',
    },
    {
      id: 8,
      batchName: 'Tax Payments - Q2 2026',
      batchId: 'BATCH-20260723-008',
      totalAmount: 120000,
      totalItems: 9,
      status: 'Completed',
      createdDate: '2026-07-23',
      createdBy: 'Ravi Kumar',
    },
  ];

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Get paginated batch list
  get batchList(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.allBatchList.slice(start, end);
  }

  get totalItems(): number {
    return this.allBatchList.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }

    return pages;
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return Math.min(end, this.totalItems);
  }

  // Selected batch for detail view
  selectedBatch: any = null;
  showResponseModal: boolean = false;
  responseData: any = null;

  // Selection state for batch rows
  selectedBatchIds: Set<number> = new Set();
  isAllSelected: boolean = false;

  // Click event to show JSON response
  onViewBatch(batch: any): void {
    // Simulate API response with CanaraBatchInitiationResponse structure
    const mockResponse: CanaraBatchInitiationResponse = {
      Response: {
        body: {
          message: {
            code: '0',
            type: 'INFO',
          },
          result: 'SUCCESSFUL',
          encryptData: {
            referenceNumber: '2024128025923562',
            BatchRequestID: 'BATCH230420250001',
            response: {
              batchReferenceNo: '379340342304',
              result: {
                rcode: {},
                rdesc:
                  'Your request has been completed successfully. Transaction with reference number 379340342304 is in Accepted state.',
              },
              TRANSACTION_REF_NO: '379340342304',
            },
          },
        },
      },
    };

    this.responseData = mockResponse;
    this.showResponseModal = true;

    // Log to console for debugging
    console.log('Response:', JSON.stringify(mockResponse, null, 2));
  }

  // Close the response modal
  closeResponseModal(): void {
    this.showResponseModal = false;
    this.responseData = null;
    this.selectedBatch = null;
  }

  // Get status badge class
  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-success';
      case 'Initiated':
        return 'bg-info';
      case 'Pending':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }

  // Toggle select all checkboxes
  toggleSelectAll(event: any): void {
    this.isAllSelected = event.target.checked;
    if (this.isAllSelected) {
      this.selectedBatchIds = new Set(this.batchList.map((b) => b.id));
    } else {
      this.selectedBatchIds.clear();
    }
  }

  // Check if a batch is selected
  isSelected(id: number): boolean {
    return this.selectedBatchIds.has(id);
  }

  // Handle individual batch selection
  onSelectBatch(id: number, event: any): void {
    if (event.target.checked) {
      this.selectedBatchIds.add(id);
    } else {
      this.selectedBatchIds.delete(id);
    }
    this.isAllSelected = this.selectedBatchIds.size === this.batchList.length;
  }

  // Cancel batch
  onCancelBatch(batch: any): void {
    console.log('Cancel batch:', batch);
    // TODO: Implement cancel logic
  }
}
