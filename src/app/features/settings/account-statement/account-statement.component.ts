import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';
import { apiResponse } from '@shared-interfaces/commans/apiResponse';
import { Http } from '@shared-services/httpService';
import { MyProvider } from '@shared-services/provider';
import { finalize } from 'rxjs';

interface FirmAccount {
  id: number | string;
  firmId: number;
  firmName: string;
  accountNos: string[];
}

interface StatementTransaction {
  transactionDate: string;
  description: string;
  valueDate: string;
  creditDebitFlag: string;
  transactionAmount: string;
  runningBalance: string;
  txnRefNumber: string;
  userRefNumber: string;
}

interface AccountStatement {
  accountNo: string;
  customerName: string;
  fromDate: string;
  endDate: string;
  openingBalance: number;
  closingBalance: number;
  transactions: StatementTransaction[];
}

@Component({
  selector: 'app-account-statement',
  imports: [CommonModule, ReactiveFormsModule, DSS_FORM_CONTROLS],
  templateUrl: './account-statement.component.html',
  styleUrl: './account-statement.component.scss',
})
export class AccountStatementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(Http);
  private readonly provider = inject(MyProvider);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  firms: FirmAccount[] = [];
  selectedFirm: FirmAccount | null = null;
  jsonData: AccountStatement[] = [];

  readonly filterForm = this.fb.group({
    firm_id: ['', Validators.required],
    accountNo: ['', Validators.required],
    fromDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  constructor() {
    this.loadFirmAccounts();
  }

  private loadFirmAccounts(): void {
    this.http
      .get<apiResponse>('bankAccount/all', {
        branch_id: this.provider.companyInfo?.company.branch_id,
      })
      .subscribe({
        next: (res: any) => {
          const accounts = res?.data ?? res ?? [];
          this.firms = accounts.map(({ accountNo, ...firm }: any) => ({
            ...firm,
            accountNos: String(accountNo ?? '')
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean),
          }));
        },
        error: () => this.errorMessage.set('Unable to load firm accounts.'),
      });
  }

  onFirmSelect(): void {
    const firmId = Number(this.filterForm.controls.firm_id.value);
    this.selectedFirm =
      this.firms.find((firm) => Number(firm.firmId) === firmId) ?? null;
    this.filterForm.controls.accountNo.setValue('');
  }

  showResult(): void {
    if (this.filterForm.invalid || !this.selectedFirm) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const { accountNo, fromDate, endDate } = this.filterForm.getRawValue();
    if (new Date(fromDate!) > new Date(endDate!)) {
      this.errorMessage.set('From Date cannot be after End Date.');
      return;
    }

    const customer = { id: this.selectedFirm.id, accountNo: accountNo! };
    this.errorMessage.set('');
    this.jsonData = [];
    this.isLoading.set(true);

    this.http
      .post<any>('inquiry/account-statement', customer, {
        sdt: fromDate!,
        edt: endDate!,
      })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => {
          const response = res?.response ?? res?.Response ?? res;
          const status = response?.metadata?.status ?? response?.status;
          if (status?.result && status.result !== 'SUCCESSFUL') {
            this.errorMessage.set(
              status?.message?.description ?? 'Account statement inquiry failed.',
            );
            return;
          }

          const encrypted = response?.body?.encryptData;
          if (!encrypted) {
            this.errorMessage.set('No statement data was returned.');
            return;
          }
          this.jsonData = [this.mapStatement(encrypted, fromDate!, endDate!)];
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            error.status === 0
              ? 'Server is unavailable.'
              : error.status === 504
                ? 'Account statement inquiry timed out.'
                : `Request failed (${error.status}).`,
          );
        },
      });
  }

  private mapStatement(data: any, fromDate: string, endDate: string): AccountStatement {
    return {
      accountNo: data.acctNumber ?? this.filterForm.controls.accountNo.value ?? '',
      customerName: data.customerShortName ?? data.customerName ?? '',
      openingBalance: Number(data.openingBalance ?? 0),
      closingBalance: Number(data.closingBalance ?? 0),
      fromDate,
      endDate,
      transactions: (data.transactions ?? []).map((txn: any) => ({
        transactionDate: txn.transactionDate,
        description: txn.description,
        valueDate: txn.valueDate,
        creditDebitFlag: txn.creditDebitFlag,
        transactionAmount: txn.transactionAmount,
        runningBalance: txn.runningBalance,
        txnRefNumber: txn.txnRefNumber,
        userRefNumber: txn.userRefNumber,
      })),
    };
  }

  formatDate(value: string): string {
    if (!value || value.length < 8) return '';

    const year = value.substring(0, 4);
    const month = value.substring(4, 6);
    const day = value.substring(6, 8);

    return `${day}/${month}/${year}`;
  }

  formatDateTime(value: string): string {
    if (!value || value.length < 14) return '';

    const year = value.substring(0, 4);
    const month = value.substring(4, 6);
    const day = value.substring(6, 8);
    const hour = value.substring(8, 10);
    const minute = value.substring(10, 12);
    const second = value.substring(12, 14);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  }
}
