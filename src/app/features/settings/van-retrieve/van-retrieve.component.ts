import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  DSS_FORM_CONTROLS,
  DssInputNumComponent,
} from '@shared-directives/dss-form-controls';

@Component({
  selector: 'app-van-retrieve',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    DSS_FORM_CONTROLS,
    HttpClientModule,
    DssInputNumComponent,
  ],
  templateUrl: './van-retrieve.component.html',
  styleUrl: './van-retrieve.component.scss',
})
export class VanRetrieveComponent implements OnInit {
  vanForm!: FormGroup;
  isLoading = false;
  responseData: any = null;
  errorMessage: string = '';
  apiUrl = 'YOUR_API_ENDPOINT_HERE';

  // Pagination properties
  currentPage = 1;
  pageSize = 5;
  totalItems = 0;
  paginatedTransactions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.vanForm = this.fb.group({
      customerID: ['111025456', [Validators.required]],
      accountNo: ['6038111000017', [Validators.required]],
      fromDate: ['2020-03-02', [Validators.required]],
      toDate: ['2025-03-02', [Validators.required]],
      noOfTransactions: [
        '500',
        [Validators.required, Validators.min(1), Validators.max(500)],
      ],
      pageNo: ['1', [Validators.required, Validators.min(1)]],
    });
  }

  onSubmit(): void {
    if (this.vanForm.invalid) {
      this.vanForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.responseData = null;

    const payload = {
      Request: {
        body: {
          encryptData: this.vanForm.value,
        },
      },
    };

    // === EXAMPLE RESPONSE DATA ===
    // To use real API, comment out the setTimeout block below
    // and uncomment the http.post section

    // Simulate API call with example response
    setTimeout(() => {
      this.responseData = {
        Response: {
          body: {
            encryptData: {
              responseCode: '0',
              responseMessage: 'Success',
              vanDetails: {
                customerID: this.vanForm.value.customerID,
                accountNo: this.vanForm.value.accountNo,
                vanNumber: 'VAN-2024-001234',
                vanStatus: 'Active',
                createdDate: '2024-01-15',
                expiryDate: '2025-01-15',
                transactions: [
                  {
                    transactionId: 'TXN-001',
                    date: '2024-03-01',
                    amount: '₹1,25,000.00',
                    type: 'Credit',
                    status: 'Completed',
                  },
                  {
                    transactionId: 'TXN-002',
                    date: '2024-03-05',
                    amount: '₹45,000.00',
                    type: 'Debit',
                    status: 'Completed',
                  },
                  {
                    transactionId: 'TXN-003',
                    date: '2024-03-10',
                    amount: '₹2,00,000.00',
                    type: 'Credit',
                    status: 'Pending',
                  },
                  {
                    transactionId: 'TXN-004',
                    date: '2024-03-15',
                    amount: '₹75,000.00',
                    type: 'Debit',
                    status: 'Completed',
                  },
                  {
                    transactionId: 'TXN-005',
                    date: '2024-03-20',
                    amount: '₹3,50,000.00',
                    type: 'Credit',
                    status: 'Completed',
                  },
                ],
                totalTransactions: 5,
                totalAmount: '₹7,95,000.00',
              },
            },
          },
        },
      };
      this.updatePagination();
      this.isLoading = false;
    }, 1500);

    /* === REAL API CALL (uncomment to use) ===
    this.http.post(this.apiUrl, payload).subscribe({
      next: (response) => {
        this.responseData = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage =
          error.message || 'An error occurred while fetching data.';
        this.isLoading = false;
      },
    });
    */
  }

  resetForm(): void {
    this.vanForm.patchValue({
      customerID: '111025456',
      accountNo: '6038111000017',
      fromDate: '2020-03-02',
      toDate: '2025-03-02',
      noOfTransactions: '1000',
      pageNo: '1',
    });
    this.errorMessage = '';
    this.responseData = null;
    this.currentPage = 1;
    this.paginatedTransactions = [];
  }

  // Pagination methods
  updatePagination(): void {
    const transactions =
      this.responseData?.Response?.body?.encryptData?.vanDetails
        ?.transactions || [];
    this.totalItems = transactions.length;
    this.currentPage = 1;
    this.updatePaginatedData(transactions);
  }

  updatePaginatedData(transactions: any[]): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTransactions = transactions.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    const transactions =
      this.responseData?.Response?.body?.encryptData?.vanDetails
        ?.transactions || [];
    const totalPages = Math.ceil(transactions.length / this.pageSize);
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    this.updatePaginatedData(transactions);
  }

  get totalPages(): number {
    const transactions =
      this.responseData?.Response?.body?.encryptData?.vanDetails
        ?.transactions || [];
    return Math.ceil(transactions.length / this.pageSize) || 1;
  }

  getVisiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  onPageSizeChange(event: any): void {
    this.pageSize = parseInt(event.target.value, 10);
    this.currentPage = 1;
    const transactions =
      this.responseData?.Response?.body?.encryptData?.vanDetails
        ?.transactions || [];
    this.updatePaginatedData(transactions);
  }

  // Expose Math to template
  get Math(): any {
    return Math;
  }
}
