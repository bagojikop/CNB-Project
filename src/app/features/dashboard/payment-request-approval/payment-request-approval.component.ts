import { RouterLink } from '@angular/router';
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
  utr?: string;
  status: string;
  message?: unknown;
}

interface PaymentResult extends PaymentResponse {
  firmName: string;
  branchName: string;
  doc_no: string | number;
  utr: string;
  payment_no: string;
  benificery: SinglePayemntEcryptData | null;
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




interface SinglePayemntEcryptData {
  destAcctNumber: string | null;
  ifscCode: string | null;
  txnAmount: string | null;
  benefName: string | null;
  userRefNo: string | null;
  narration: string | null;
  valueDate: string | null;
  TrnType: string | null;
}

interface PendingSinglePayment {
  status?: string | null;
  error_message?: string | null;
  branch_id: string;
  firm_id: string | number;
  srcAcctNumber: string;
  doc_no: string | number;
  benificery: SinglePayemntEcryptData | null;
  payment_no: string | null
}

@Component({
  selector: 'app-payment-request-approval',
  imports: [RouterLink, CurrencyPipe, CommonModule, FormsModule],
  templateUrl: './payment-request-approval.component.html',
  styleUrl: './payment-request-approval.component.scss',
})
export class PaymentRequestApprovalComponent implements OnInit {
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
    this.selectedSingleItems.clear();
  }

  approvalData: any[] = [];

  ngOnInit(): void {
    const branchId = this.provider.companyInfo?.company?.branch_id;


    forkJoin({
      payments: this.http.get<PendingSinglePayment[]>('Dashoboard/pending-details', {
        branch_id: branchId || '',
        id: 1,
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
          this.approvalData = (result ?? []).map((payment, index) => {

            return {

              ...payment,
              firmName: firmNames.get(String(payment.firm_id)) ?? payment.firm_id,
              branchName: branchNames.get(String(payment.branch_id)) ?? payment.branch_id,
              // The response has no row ID; use a unique local selection key.

              paymentType: 'Single',
              status: payment.status?.trim() || 'Pending',
              message: payment.error_message,
            };
          });
          this.selectedSingleItems.clear();
        },
        error: () => {
          this.approvalData = [];
          this.loadError = 'Unable to load pending payment requests. Please try again.';
        },
      });
  }

  selectedSingleItems: Set<number> = new Set();

  // Computed property for Select All checkbox
  get allSelected(): boolean {
    const pendingItems = this.filteredData.filter(
      (item) =>
        item.status !== 'Approved' &&
        item.paymentType.toLowerCase() === 'single',
    );
    if (pendingItems.length === 0) return false;
    return pendingItems.every((item) => this.selectedSingleItems.has(item.vch_id));
  }

  toggleAllSelections(event: any): void {
    const checked = event.target.checked;
    const pendingItems = this.filteredData.filter(
      (item) =>
        item.status !== 'Approved' &&
        item.paymentType.toLowerCase() === 'single',
    );
    if (checked) {
      pendingItems.forEach((item) => {
        if (item.status != "Failed")
          this.selectedSingleItems.add(item.vch_id)
      });
    } else {
      pendingItems.forEach((item) => this.selectedSingleItems.delete(item.vch_id));
    }
  }

  searchTerm = '';

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.selectedSingleItems.clear();
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
        selectedIds.includes(item.vch_id) &&
        item.paymentType.toLowerCase() === 'single' && item.status?.toLowerCase() != "failed",
    );

    if (selectedItems.length === 0) {
      alert('No valid single payment requests selected.');
      return;
    }

    // Loop through each selected item and call approveSinglePayment

    selectedItems.forEach((item) => {

      // Set status to 'Approved' for each selected single payment
      this.documents.push({ vch_id: item.vch_id, accountNo: item.srcAcctNumber })
    });

    // Clear selection after push
    this.selectedSingleItems.clear();

    // Show success message

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
      this.selectedSingleItems.has(item.vch_id) && item.paymentType === 'Single'
      && (action === 'reject' || item.status?.toLowerCase() != 'failed'),
    );
    if (!selectedItems.length) return;

    // Build a fresh payload for this selection on every request.
    this.documents = selectedItems.map((item) => ({ vch_id: item.vch_id, accountNo: item.srcAcctNumber }));
    this.respondedPaymentIds.clear();
    this.paymentResults = [];
    this.loadError = '';
    this.isSubmitting = true;
    this.http.post<PaymentResponse[] | PaymentResponse>(`SinglePaymentRequest/${action}`, this.documents)
      // of<PaymentResponse[]>(
      //   selectedItems.map((item, index) => ({
      //     payment_no: String(item.payment_no),
      //     utr: action === 'create' && index === 0 ? 'DEMO123456789' : '',
      //     status: action === 'reject' ? 'REJECTED' : index === 0 ? 'SUCCESS' : 'FAILED',
      //     message: action === 'reject'
      //       ? 'Demo payment rejected successfully.'
      //       : index === 0
      //       ? 'Demo payment processed successfully.'
      //       : 'Demo payment failed: beneficiary account is invalid.',
      //   }))
      // )
      .pipe(finalize(() => { this.isSubmitting = false; }), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const results = Array.isArray(response) ? response : response ? [response] : [];
          const byPaymentNo = new Map(results.map((result) => [String(result.payment_no), result]));
          this.paymentResults = selectedItems.map((item) => {
            const result = byPaymentNo.get(String(item.payment_no))
              ?? (action === 'reject' ? byPaymentNo.get(`VCH-${item.vch_id}`) : undefined);
            if (result) {
              this.respondedPaymentIds.add(item.vch_id);
              item.status = result.status;
              item.message = result.message;
              item.utr = result.utr;
              this.selectedSingleItems.delete(item.vch_id);
            }
            return {
              firmName: item.firmName,
              branchName: item.branchName,
              doc_no: item.doc_no,
              benificery: item.benificery,
              payment_no: result?.payment_no ?? String(item.payment_no),
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
