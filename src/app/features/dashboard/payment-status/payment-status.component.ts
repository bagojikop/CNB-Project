import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { Http } from '@shared-services/httpService';
import { MyProvider } from '@shared-services/provider';

interface Beneficiary {
  benefName: string | null;
  destAcctNumber: string | null;
  ifscCode: string | null;
  txnAmount: string | null;
  valueDate: string | null;
}
interface StatusPayment {
  id?: number;
  payment_no: string;
  branch_id: string | number;
  firm_id: string | number;
  srcAcctNumber: string;
  doc_no: string | number;
  benificery: Beneficiary | null;
  utr: string | null;
  status: string | null;
  message?: string | null;
  firmName?: string;
  branchName?: string;
}
interface PaymentResponse {
  payment_no: string;
  utr: string | null;
  status: string;
  message: string | null;
}

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.component.html',
  styleUrls: ['../payment-request-approval/payment-request-approval.component.scss', './payment-status.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class PaymentStatusComponent implements OnInit {
  private http = inject(Http);
  private provider = inject(MyProvider);
  private destroyRef = inject(DestroyRef);
  payments: StatusPayment[] = [];
  selectedPayments = new Set<StatusPayment>();
  searchTerm = '';
  isLoading = false;
  errorMessage = '';
  detail: StatusPayment | null = null;

  ngOnInit(): void { this.loadPayments(); }

  private loadPayments(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = '';
    forkJoin({
      payments: this.http.get<StatusPayment[]>('Dashoboard/pending-details', {
        branch_id: this.provider.companyInfo?.company?.branch_id || '', id: 5,
      }),
      firms: this.http.readJson<{ firm_code: string | number; firm_name: string }[]>('assets/data/firms.json').pipe(catchError(() => of([]))),
      branches: this.http.readJson<{ branch_code: string | number; branch_name: string }[]>('assets/data/branches.json').pipe(catchError(() => of([]))),
    }).pipe(finalize(() => { this.isLoading = false; }), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ payments, firms, branches }) => {
          this.payments = (payments ?? []).map((payment) => ({
            ...payment,
            firmName: firms.find((firm) => String(firm.firm_code) === String(payment.firm_id))?.firm_name ?? String(payment.firm_id),
            branchName: branches.find((branch) => String(branch.branch_code) === String(payment.branch_id))?.branch_name ?? String(payment.branch_id),
          }));
          this.selectedPayments.clear();
        },
        error: () => { this.errorMessage = 'Unable to refresh payment status. Please try again.'; },
      });
  }

  refreshStatus(): void {
    if (this.isLoading || !this.payments.length) return;
    if (this.payments.some((item) => item.id == null)) {
      this.errorMessage = 'The pending-details API must return each payment ID before status can be updated.';
      return;
    }
    const submittedPayments = [...this.payments];
    const documents = submittedPayments.map((item) => ({
      id: item.id,
      accountNo: item.srcAcctNumber,
    }));
    this.isLoading = true;
    this.errorMessage = '';
    this.http.post<PaymentResponse[] | PaymentResponse>('SinglePaymentRequest/update', documents)
      .pipe(finalize(() => { this.isLoading = false; }), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const results = Array.isArray(response) ? response : response ? [response] : [];
          const byNumber = new Map(results.map((result) => [String(result.payment_no), result]));
          submittedPayments.forEach((item) => {
            const result = byNumber.get(String(item.payment_no));
            if (!result) {
              this.errorMessage = 'Some payments did not receive an updated status.';
              return;
            }
            item.status = result.status;
            item.utr = result.utr;
            item.message = result.message;
            if (!this.isFailed(item.status)) this.selectedPayments.delete(item);
          });
        },
        error: () => { this.errorMessage = 'Unable to update payment status. Please try again.'; },
      });
  }

  get filteredPayments(): StatusPayment[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.payments.filter((item) => !query || [item.firmName, item.branchName,
    item.doc_no, item.payment_no, item.srcAcctNumber, item.utr, item.status,
    item.benificery?.benefName, item.benificery?.destAcctNumber,
    item.benificery?.ifscCode, item.benificery?.txnAmount, item.benificery?.valueDate,
    ].some((value) => String(value ?? '').toLowerCase().includes(query)));
  }
  onSearchChange(value: string): void { this.searchTerm = value; this.selectedPayments.clear(); }
  isFailed(status: string | null): boolean {
    return ['FAILED', 'FAILURE', 'FAIL', 'ERROR'].includes((status ?? '').trim().toUpperCase());
  }
  get allSelected(): boolean {
    const failed = this.filteredPayments.filter((item) => this.isFailed(item.status) && item.id != null);
    return failed.length > 0 && failed.every((item) => this.selectedPayments.has(item));
  }
  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.filteredPayments.filter((item) => this.isFailed(item.status) && item.id != null).forEach((item) => {
      if (checked) this.selectedPayments.add(item); else this.selectedPayments.delete(item);
    });
  }
  toggleSelection(item: StatusPayment): void {
    if (!this.isFailed(item.status) || item.id == null || this.isLoading) return;
    if (this.selectedPayments.has(item)) this.selectedPayments.delete(item); else this.selectedPayments.add(item);
  }
  rejectPayments(): void {
    if (this.isLoading) return;
    const selected = [...this.selectedPayments].filter((item) => this.isFailed(item.status));
    if (!selected.length) return;
    if (selected.some((item) => item.id == null)) {
      this.errorMessage = 'The pending-details API must return each payment ID before it can be rejected.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.http.post<PaymentResponse[] | PaymentResponse>('SinglePaymentRequest/reject',
      selected.map((item) => ({ id: item.id, accountNo: item.srcAcctNumber })))
      .pipe(finalize(() => { this.isLoading = false; }), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const results = Array.isArray(response) ? response : response ? [response] : [];
          const byNumber = new Map(results.map((result) => [String(result.payment_no), result]));
          const removed = new Set<StatusPayment>();
          selected.forEach((item) => {
            const result = byNumber.get(String(item.payment_no));
            if (!result) { this.errorMessage = 'Some selected payments did not receive a result.'; return; }
            Object.assign(item, { status: result.status, utr: result.utr ?? item.utr, message: result.message });
            if (['SUCCESS', 'SUCCESSFUL', 'REJECTED'].includes(result.status.trim().toUpperCase())) {
              removed.add(item);
              this.selectedPayments.delete(item);
            }
          });
          this.payments = this.payments.filter((item) => !removed.has(item));
        },
        error: () => { this.errorMessage = 'Unable to confirm rejection. Refresh payment status before retrying.'; },
      });
  }
  statusClass(status: string | null): string {
    const value = (status ?? '').trim().toUpperCase();
    if (this.isFailed(status) || value === 'REJECTED') return 'result-status result-status-danger';
    if (['SUCCESS', 'SUCCESSFUL', 'APPROVED', 'COMPLETED'].includes(value)) return 'result-status result-status-success';
    if (['PENDING', 'HOLD'].includes(value)) return 'result-status result-status-warning';
    if (['PROCESSING', 'IN PROGRESS'].includes(value)) return 'result-status result-status-info';
    return 'result-status result-status-neutral';
  }
  showMessage(item: StatusPayment, dialog: HTMLDialogElement): void { this.detail = item; dialog.showModal(); }
}
