import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';
import { Http } from '@shared-services/httpService';
import { MyProvider } from '@shared-services/provider';
import { finalize } from 'rxjs';

interface BankAccount {
  id: number | string;
  firmName: string;
  selectionLabel: string;
  accountNo: string;
  accountNos: string[];
  customerId: string;
}

interface TransactionEnquiryFields {
  customerID: string;
  fromDate: string;
  toDate: string;
  noOfTransactions: string;
  pageNo: string;
}
interface VanTxnResult {
  utr: string | null;
  vanNo: string | null;
  txnRefNo: string | null;
  amount: number | null;
  status: string;
  message: string;
  response: unknown;
}
export type VANTransactionEnquiryEncryptData = TransactionEnquiryFields &
  ({ vanNo: string; accountNo?: never } | { accountNo: string; vanNo?: never });

@Component({
  selector: 'app-van-transaction',
  imports: [RouterLink, CommonModule, ReactiveFormsModule, DSS_FORM_CONTROLS],
  templateUrl: './van-transaction.component.html',
  styleUrl: './van-transaction.component.scss',
})
export class VanTransactionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(Http);
  private readonly provider = inject(MyProvider);
  private readonly destroyRef = inject(DestroyRef);
  get isVanEnquiry(): boolean { return !!this.filterForm.controls.vanNo.value?.trim(); }
  get selectedBank(): BankAccount | undefined {
    return this.accounts.find(account => String(account.id) === String(this.filterForm.controls.bankId.value));
  }
  accounts: BankAccount[] = [];
  loadingAccounts = false;
  isLoading = false;
  errorMessage = '';
  result: unknown = null;
  rows: Record<string, unknown>[] = [];
  totalAmount: number | null = null;
  statementAccount = '';
  statementName = '';
  statementPage = '';
  statementPages = '';
  showFilters = true;
  currentPage = 1;
  totalPages = 1;
  showUpdatePrompt = false;
  isUpdating = false;
  updateMessage = '';
  updateResults: VanTxnResult[] | null = null;
  private statementData: Record<string, unknown> | null = null;
  private activeRequest: { apiUrl: string; bankId: number | string; data: VANTransactionEnquiryEncryptData } | null = null;

  editFilters(): void {
    if (this.isLoading) return;
    this.showFilters = true;
    this.errorMessage = '';
  }

  goToPage(page: number): void {
    if (this.isLoading || !this.activeRequest || !Number.isInteger(page) ||
      page < 1 || page > this.totalPages || page > 999 || page === this.currentPage) return;
    this.fetchPage(page);
  }
  readonly columns = [
    { key: 'VanNo', label: 'VAN number', isAmount: false },
    { key: 'TxnDate', label: 'Transaction date', isAmount: false },
    { key: 'ValueDate', label: 'Value date', isAmount: false },
    { key: 'TransactionAmount', label: 'Amount', isAmount: true },
    { key: 'TxnType', label: 'Type', isAmount: false },
    { key: 'TxnDescription', label: 'Description', isAmount: false },
    { key: 'RemitterName', label: 'Remitter', isAmount: false },
    { key: 'RemitterAccountNumber', label: 'Remitter account', isAmount: false },
    { key: 'RemitterBankIFSC', label: 'IFSC', isAmount: false },
    { key: 'TxnRefNo', label: 'Reference number', isAmount: false },
    { key: 'Utr', label: 'UTR', isAmount: false },
  ];

  displayCell(value: unknown): string {
    return value == null || String(value).trim() === '' ? '-' : String(value).trim();
  }

  private clearStatement(): void {
    this.updateResults = null;
    this.statementData = null;
    this.showUpdatePrompt = false;
    this.updateMessage = '';
    this.result = null;
    this.rows = [];
    this.totalAmount = null;
    this.statementAccount = this.statementName = this.statementPage = this.statementPages = '';
  }

  private readStatement(response: unknown): void {
    const errorBody = response as { Error?: unknown; error?: unknown } | null;
    const apiError = errorBody?.Error ?? errorBody?.error;
    if (apiError) {
      this.errorMessage = typeof apiError === 'string' ? apiError : 'Unable to load the VAN transaction statement.';
      return;
    }
    const root = response as { Response?: { body?: { encryptData?: Record<string, unknown> } }; response?: { body?: { encryptData?: Record<string, unknown> } } } | null;
    const data = (root?.Response ?? root?.response)?.body?.encryptData ?? {};
    const details = data['TransactionInquiryDetailsDTO'] ?? data['transactionInquiryDetailsDTO'] ?? [];
    if (!Array.isArray(details) || details.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
      this.errorMessage = 'The response did not contain transaction details.';
      return;
    }
    this.statementData = data;
    this.showUpdatePrompt = details.length > 0;
    this.rows = details.map(row => Object.fromEntries(this.columns.map(column => [column.key,
      row[column.key] ?? row[column.key[0].toLowerCase() + column.key.slice(1)]])));
    this.statementAccount = String(data['acctNo'] ?? data['CasaAccountNumber'] ?? data['casaAccountNumber'] ?? '');
    this.statementName = String(data['CasaAccountName'] ?? data['casaAccountName'] ?? '');
    this.statementPage = String(data['pageNo'] ?? '');
    this.statementPages = String(data['TotalNoOfPages'] ?? data['totalNoOfPages'] ?? '');
    const pages = Number(this.statementPages);
    this.totalPages = Number.isInteger(pages) && pages > 0 ? Math.min(pages, 999) : 1;
    this.totalAmount = null;
    let cents = 0;
    for (const row of this.rows) {
      const amount = String(row['TransactionAmount'] ?? '').trim();
      if (!/^-?\d+(\.\d{1,2})?$/.test(amount)) return;
      const value = Math.round(Number(amount) * 100);
      if (!Number.isSafeInteger(value) || !Number.isSafeInteger(cents + value)) return;
      cents += value;
    }
    this.totalAmount = cents / 100;
  }
  readonly filterForm = this.fb.group({
    bankId: ['', Validators.required],
    accountNo: [''],
    vanNo: [''],
    fromDate: [this.yesterday() + 'T01:00:00', Validators.required],
    toDate: [this.yesterday() + 'T23:59:59.999', Validators.required],
    noOfTransactions: [100, [Validators.required, Validators.min(1), Validators.max(500)]],
    pageNo: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
  });

  constructor() { this.loadAccounts(); }

  private yesterday(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  loadAccounts(): void {
    if (this.loadingAccounts || this.isLoading) return;
    this.accounts = [];
    this.filterForm.controls.bankId.setValue('');
    this.filterForm.controls.accountNo.setValue('');
    const branchId = this.provider.companyInfo?.company?.branch_id;
    this.loadingAccounts = true;
    this.errorMessage = '';
    this.http.get<any>('bankAccount/all', branchId == null || String(branchId).trim() === '' ? {} : { branch_id: branchId }).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loadingAccounts = false)).subscribe({
      next: response => {
        const accounts = response?.data ?? response;
        if (!Array.isArray(accounts)) {
          this.errorMessage = 'Unable to load bank accounts.';
          return;
        }
        this.accounts = accounts
          .map(account => ({
          ...account,
          selectionLabel: `${account.firmName} ? ${account.customerId ?? account.customerID ?? ''}`,
          customerId: String(account.customerId ?? account.customerID ?? '').trim(),
          accountNos: String(account.accountNo ?? '').split(',').map((value: string) => value.split('|')[0].trim()).filter(Boolean),
        }));
      },
      error: () => this.errorMessage = 'Unable to load bank accounts. Please retry.',
    });
  }

  private formatDateTime(value: string): string | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value);
    if (!match) return null;
    const [, year, month, day, hour, minute, second = '00', fraction] = match;
    const normalized = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    const parsed = new Date(normalized + 'Z');
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 19) !== normalized) return null;
    return `${year}-${month}-${day} ${hour}:${minute}:${second}${fraction ? '.' + fraction.padEnd(3, '0') : ''}`;
  }

  onBankSelect(): void {
    this.filterForm.controls.accountNo.setValue('');
    this.filterForm.controls.pageNo.setValue(1);
    this.activeRequest = null;
    this.clearStatement();
  }

  showResult(): void {
    if (this.isLoading || this.loadingAccounts) return;
    this.errorMessage = '';
    this.clearStatement();
    this.filterForm.controls.pageNo.setValue(1);
    const values = this.filterForm.getRawValue();
    const bank = this.accounts.find(account => String(account.id) === String(values.bankId));
    if (this.filterForm.invalid || !bank ||
      !Number.isInteger(values.noOfTransactions) || !Number.isInteger(values.pageNo)) {
      this.filterForm.markAllAsTouched();
      this.errorMessage = 'Select a bank account and dates. Enter 1-500 transactions and page 1-999 as whole numbers.';
      return;
    }
    const fromDate = this.formatDateTime(values.fromDate!);
    const toDate = this.formatDateTime(values.toDate!);
    if (!fromDate || !toDate || fromDate > toDate) {
      this.errorMessage = 'Enter valid dates and times with From on or before To.';
      return;
    }
    if (!bank.customerId) {
      this.errorMessage = 'The selected bank account is missing its customer ID.';
      return;
    }
    const vanNo = values.vanNo?.trim() ?? '';
    const accountNo = values.accountNo ?? '';
    if (!vanNo && !bank.accountNos.includes(accountNo)) {
      this.errorMessage = 'Select an account belonging to the selected bank.';
      return;
    }
    const encryptData: VANTransactionEnquiryEncryptData = {
      customerID: bank.customerId,
      fromDate, toDate,
      ...(vanNo ? { vanNo } : { accountNo }),
      noOfTransactions: String(values.noOfTransactions),
      pageNo: String(values.pageNo),
    };
    const apiUrl = vanNo ? 'van/get-van-transactions-with-van-no' : 'van/get-van-casa-transactions';
    this.activeRequest = { apiUrl, bankId: bank.id, data: encryptData };
    this.fetchPage(1);
  }

  skipUpdate(): void {
    if (!this.isLoading) this.showUpdatePrompt = false;
  }

  updateStatement(): void {
    if (this.isLoading || !this.showUpdatePrompt || !this.statementData) return;
    this.isLoading = this.isUpdating = true;
    this.updateResults = null;
    this.errorMessage = this.updateMessage = '';
    this.http.post<unknown>('van/update-statement', structuredClone(this.statementData)).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { this.isLoading = this.isUpdating = false; }),
    ).subscribe({
      next: response => {
        const body = response as { Error?: unknown; error?: unknown; success?: boolean; Success?: boolean } | null;
        const error = body?.Error ?? body?.error;
        if (response === false || error || body?.success === false || body?.Success === false) {
          this.errorMessage = typeof error === 'string' ? error : 'Unable to update the statement. Please retry.';
          return;
        }
        if (!Array.isArray(response) || response.some(item => !item || typeof item !== 'object' || Array.isArray(item))) {
          this.errorMessage = 'The update response did not contain transaction results.';
          return;
        }
        this.updateResults = response.map(item => ({
          utr: item.utr ?? item.Utr ?? null,
          vanNo: item.vanNo ?? item.VanNo ?? null,
          txnRefNo: item.txnRefNo ?? item.TxnRefNo ?? null,
          amount: item.amount ?? item.Amount ?? null,
          status: item.status ?? item.Status ?? '',
          message: item.message ?? item.Message ?? '',
          response: item.response ?? item.Response ?? null,
        }));
        this.showUpdatePrompt = false;
        this.updateMessage = `Update results for page ${this.currentPage}: ${this.updateResults.length} transactions.`;
      },
      error: () => this.errorMessage = 'Unable to update the statement. Please retry.',
    });
  }

  private fetchPage(page: number): void {
    if (!this.activeRequest) return;
    const { apiUrl, bankId, data } = this.activeRequest;
    this.isLoading = true;
    this.updateResults = null;
    this.statementData = null;
    this.showUpdatePrompt = false;
    this.updateMessage = '';
    this.errorMessage = '';
    const encryptData = { ...data, pageNo: String(page) };
    this.http.post<unknown>(apiUrl, { Request: { body: { encryptData } } }, { id: bankId }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading = false),
    ).subscribe({
      next: response => {
        this.readStatement(response);
        if (!this.errorMessage) {
          this.result = response;
          this.currentPage = page;
          this.showFilters = false;
        } else {
          this.showFilters = true;
        }
      },
      error: () => {
        this.errorMessage = 'Unable to load the VAN transaction statement. Please retry.';
        this.showFilters = true;
      },
    });
  }
}
