import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';
import { Http } from '@shared-services/httpService';
import { MyProvider } from '@shared-services/provider';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
//import data from '@assets/data/firms.json';
export interface BalanceEncryptData {
  acctNumber: string;
  currentBalance: string;
  unclearFunds: string;
  netBalance: string;
  balAvailable: string;
  holdAmount: string;
  overdraft: string;
  customerName: string;
  customerID: string;
}

@Component({
  selector: 'app-balance-inquiry',
  templateUrl: './balance-inqury.component.html',
  styleUrls: ['./balance-inqury.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, DSS_FORM_CONTROLS],
  standalone: true,
})
export class BalanceInquiryComponent {
  balanceForm: FormGroup;
  readonly isLoading = signal(false);
  readonly balanceData = signal<BalanceEncryptData[]>([]);
  readonly errors = signal<unknown[]>([]);
  readonly showEmptyState = computed(() =>
    !this.isLoading() &&
    this.balanceData().length === 0 &&
    this.errors().length === 0
  );
  filteredData: BalanceEncryptData[] = []
  firms: any[] = [];
  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalRecords = 0;
  pageSizeOptions = [5, 10, 20, 50];
  selectedFirm: any = { accountNos: [] };

  private readonly http = inject(Http);
  private readonly provider = inject(MyProvider)
  constructor(private fb: FormBuilder) {
    this.balanceForm = this.fb.group({
      firm_id: ['', Validators.required],
      accountNo: ['*', [Validators.pattern(/^(\*|\d{9,18})$/)]],
    });
    this.http.get('bankAccount/all', { branch_id: this.provider.companyInfo?.company.branch_id }).subscribe((res) => {

      this.firms = res.data || res;

      this.firms = this.firms.map(({ accountNo, ...firm }) => ({
        ...firm,
        accountNos: [

          ...(accountNo || '').split(',')
            .map((value: any) => value.trim())
            .filter(Boolean),
        ]

      }));
    })



  }



  onFirmSelect(): void {
    const firmId = +this.balanceForm.get('firm_id')?.value;

    this.selectedFirm = this.firms.find(
      firm => firm.firmId === firmId
    );
    this.balanceForm.patchValue({ accountNo: '*' });
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get pagedData(): BalanceEncryptData[] | null {
    if (!this.filteredData || this.filteredData.length === 0) {
      return null;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  // Utility method for template to avoid Math.min error
  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  async fetchBalance() {
    if (this.balanceForm.invalid) {
      this.balanceForm.markAllAsTouched();
      return;
    }

    const accountNumber = this.balanceForm.value.accountNo;
    const accNos = accountNumber === '*' || accountNumber === ''
      ? this.selectedFirm.accountNos
      : [accountNumber];

    this.balanceData.set([]);
    this.errors.set([]);
    this.isLoading.set(true);

    try {
      for (const accountNo of accNos) {
        try {
          const res: any = await firstValueFrom(
            this.http.post('inquiry/balance', {
              id: this.selectedFirm.id,
              accountNo,
            }),
          );

          if (res?.response?.metadata?.status?.result !== 'SUCCESSFUL') {
            this.errors.update(errors => [...errors, { accountNo, error: res }]);
            continue;
          }

          const encryptData = res?.response?.body?.encryptData;

          if (encryptData) {
            this.balanceData.update(data => [...data, encryptData]);
          }
        } catch (error: unknown) {
          const httpError = error as HttpErrorResponse;

          this.errors.update(errors => [...errors, {
            accountNo,
            status: httpError.status,
            message:
              httpError.status === 0
                ? 'Server is unavailable'
                : httpError.status === 504
                  ? 'Balance inquiry timed out'
                  : `Request failed (${httpError.status})`,
            error: httpError.error,
          }]);
        }
      }
    } finally {
      this.filteredData = [...this.balanceData()];
      this.totalRecords = this.filteredData.length;
      this.currentPage = 1;
      this.isLoading.set(false);
    }
  }
}

