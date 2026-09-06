import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Http } from '@shared-services/httpService';
import { MyProvider } from '@shared-services/provider';
import { catchError, finalize, forkJoin, of } from 'rxjs';

interface PaymentResponse {
  payment_no: string;
  utr: string;
  status: string;
  message: unknown;
}

interface PaymentResult extends PaymentResponse {
  firmName: string;
  branchName: string;
  doc_no: string | number;
  utr: string;
  payment_no: string;
  benificery: BulkPaymentEncryptData | null;
}

interface Firm {
  firm_code: string | number;
  firm_name: string;
}

interface Branch {
  branch_code: string | number;
  branch_name: string;
}

interface document {
  vch_id: number;
  accountNo: string;
}




interface BulkPaymentEncryptData {
  destAcctNumber: string | null;
  ifscCode: string | null;
  txnAmount: string | null;
  benefName: string | null;
  userRefNo: string | null;
  narration: string | null;
  valueDate: string | null;
  TrnType: string | null;
}

interface PendingBulkPayment {
  vch_id: number;
  branch_id: string;
  firm_id: string | number;
  srcAcctNumber: string;
  doc_no: string | number;
  benificery: BulkPaymentEncryptData | null;
  payment_no: string | null
}

@Component({
  selector: 'app-bulk-payment-request',
  imports: [CurrencyPipe, CommonModule, FormsModule],
  templateUrl: './bulk-payment-request.component.html',
  styleUrl: './bulk-payment-request.component.scss',
})
export class BulkPaymentRequestComponent implements OnInit {
  private http = inject(Http);
  private provider = inject(MyProvider);
  private destroyRef = inject(DestroyRef);
  private documents: document[] = [];
  loadError = '';
  isSubmitting = false;
  paymentResults: PaymentResult[] = [];
  private respondedPaymentIds = new Set<number>();
  resultDetail: PaymentResult | null = null;

  formatResultMessage(message: unknown): unknown {

    if (typeof message !== 'string') return message;

    try {
      return JSON.parse(message);
    } catch {
      return message;
    }
  }

  showResultMessage(result: PaymentResult, dialog: HTMLDialogElement): void {
    this.resultDetail = result;
    dialog.showModal();
  }

  backToPayments(): void {
    this.approvalData = this.approvalData.filter(
      (item) => !this.respondedPaymentIds.has(item.vch_id) || this.isFailedPayment(item.status),
    );
    this.respondedPaymentIds.clear();
    this.paymentResults = [];
    this.loadError = '';
    this.selectedBulkItems.clear();
  }

  approvalData: any[] = [];

  ngOnInit(): void {
    const branchId = this.provider.companyInfo?.company?.branch_id;


    forkJoin({
      payments: this.http.get<PendingBulkPayment[]>('Dashoboard/pending-details', {
        branch_id: branchId || '',
        id: 2,
      }),
      firms: this.http.readJson<Firm[]>('assets/data/firms.json').pipe(
        catchError(() => of([] as Firm[])),
      ),
      branches: this.http.readJson<Branch[]>('assets/data/branches.json').pipe(
        catchError(() => of([] as Branch[])),
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ payments: result, firms, branches }) => {
          const firmNames = new Map(firms.map((firm) => [String(firm.firm_code), firm.firm_name]));
          const branchNames = new Map(branches.map((branch) => [String(branch.branch_code), branch.branch_name]));
          this.approvalData = (result ?? []).map((payment) => {

            return {

              ...payment,
              firmName: firmNames.get(String(payment.firm_id)) ?? payment.firm_id,
              branchName: branchNames.get(String(payment.branch_id)) ?? payment.branch_id,

              paymentType: 'Bulk',
              status: 'Pending',
            };
          });
          this.selectedBulkItems.clear();
        },
        error: () => {
          this.approvalData = [];
          this.loadError = 'Unable to load pending payment requests. Please try again.';
        },
      });
  }

  selectedBulkItems: Set<number> = new Set();

  // Computed property for Select All checkbox
  get allSelected(): boolean {
    const pendingItems = this.filteredData.filter(
      (item) =>
        item.status !== 'Approved' &&
        item.paymentType.toLowerCase() === 'bulk',
    );
    if (pendingItems.length === 0) return false;
    return pendingItems.every((item) => this.selectedBulkItems.has(item.vch_id));
  }

  toggleAllSelections(event: any): void {
    const checked = event.target.checked;
    const pendingItems = this.filteredData.filter(
      (item) =>
        item.status !== 'Approved' &&
        item.paymentType.toLowerCase() === 'bulk',
    );
    if (checked) {
      pendingItems.forEach((item) => {
        if (!this.isFailedPayment(item.status))
          this.selectedBulkItems.add(item.vch_id)
      });
    } else {
      pendingItems.forEach((item) => this.selectedBulkItems.delete(item.vch_id));
    }
  }

  searchTerm = '';

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.selectedBulkItems.clear();
  }

  // Search the displayed payment fields.
  get filteredData(): any[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.approvalData.filter((item) => {
      if (!query) return true;

      return [
        item.firmName, item.branchName, item.srcAcctNumber, item.doc_no,
        item.benificery?.valueDate, item.benificery?.benefName,
        item.benificery?.destAcctNumber, item.benificery?.ifscCode,
        item.benificery?.txnAmount,
      ].some((value) => String(value ?? '').toLowerCase().includes(query));
    });
  }

  isFailedPayment(status: string): boolean {
    return ['FAILED', 'FAILURE', 'FAIL', 'ERROR'].includes((status ?? '').trim().toUpperCase());
  }

  getResultStatusClass(status: string): string {
    switch ((status ?? '').trim().toUpperCase()) {
      case 'SUCCESS':
      case 'SUCCESSFUL':
      case 'APPROVED':
      case 'COMPLETED':
        return 'result-status result-status-success';
      case 'FAILED':
      case 'FAILURE':
      case 'REJECTED':
      case 'ERROR':
        return 'result-status result-status-danger';
      case 'PENDING':
      case 'HOLD':
      case 'ON HOLD':
        return 'result-status result-status-warning';
      case 'PROCESSING':
      case 'IN PROGRESS':
        return 'result-status result-status-info';
      default:
        return 'result-status result-status-neutral';
    }
  }

  // Bulk payment selection methods
  isBulkSelected(itemId: number): boolean {
    return this.selectedBulkItems.has(itemId);
  }

  toggleBulkSelection(itemId: number): void {
    if (this.selectedBulkItems.has(itemId)) {
      this.selectedBulkItems.delete(itemId);
    } else {
      this.selectedBulkItems.add(itemId);
    }
  }


  createPayments(): void {
    this.submitSelectedPayments('create');
  }

  rejectPayments(): void {
    this.submitSelectedPayments('reject');
  }

  private submitSelectedPayments(action: 'create' | 'reject'): void {
    if (this.isSubmitting) return;
    const selectedItems = this.approvalData.filter((item) =>
      this.selectedBulkItems.has(item.vch_id) && item.paymentType === 'Bulk'
      && (action === 'reject' || !this.isFailedPayment(item.status)),
    );
    if (!selectedItems.length) return;

    // Build a fresh payload for this selection on every request.
    this.documents = selectedItems.map((item) => ({ vch_id: item.vch_id, accountNo: item.srcAcctNumber }));
    this.respondedPaymentIds.clear();
    this.paymentResults = [];
    this.loadError = '';
    this.isSubmitting = true;
    // Assumes the bulk API uses the same document payload and result shape as single payments.
    this.http.post<PaymentResponse[] | PaymentResponse>(`BulkPaymentRequest/${action}`, this.documents)
      .pipe(finalize(() => { this.isSubmitting = false; }), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const results = Array.isArray(response) ? response : response ? [response] : [];
          const byPaymentNo = new Map(results.map((result) => [String(result.payment_no), result]));
          this.paymentResults = selectedItems.map((item) => {
            const result = byPaymentNo.get(String(item.payment_no));
            if (result) {
              this.respondedPaymentIds.add(item.vch_id);
              item.status = result.status;
              item.message = result.message;
              item.utr = result.utr;
              this.selectedBulkItems.delete(item.vch_id);
            }
            return {
              firmName: item.firmName,
              branchName: item.branchName,
              doc_no: item.doc_no,
              benificery: item.benificery,
              payment_no: String(item.payment_no),
              utr: result?.utr ?? '',
              status: result?.status ?? 'No response',
              message: result?.message ?? (result ? null : 'No result returned for this payment.'),
            };
          });
        },
        error: () => {
          this.loadError = 'Unable to retrieve payment results. Check payment status before retrying.';
          this.paymentResults = selectedItems.map((item) => ({
            firmName: item.firmName,
            branchName: item.branchName,
            doc_no: item.doc_no,
            benificery: item.benificery,
            payment_no: String(item.payment_no),
            utr: '',
            status: 'Unknown',
            message: 'The request failed; payment status could not be confirmed.',
          }));
        },
      });


  }
}
