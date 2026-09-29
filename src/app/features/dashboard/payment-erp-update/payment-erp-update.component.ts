import { RouterLink } from '@angular/router';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MyProvider } from '@shared-services/provider';
import { ErpPayment, PaymentErpUpdateService } from './payment-erp-update.service';

@Component({
  selector: 'app-payment-erp-update',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './payment-erp-update.component.html',
  styleUrls: ['../payment-request-approval/payment-request-approval.component.scss', './payment-erp-update.component.scss'],
})
export class PaymentErpUpdateComponent implements OnInit {
  private api = inject(PaymentErpUpdateService);
  private provider = inject(MyProvider);
  private destroyRef = inject(DestroyRef);
  payments: ErpPayment[] = [];
  selectedPayments = new Set<ErpPayment>();
  searchTerm = '';
  isLoading = false;
  isUpdating = false;
  errorMessage = '';
  successMessage = '';



  ngOnInit(): void { this.loadPayments(); }

  canUpdate(item: ErpPayment): boolean {
    return ['SUCCESS', 'SUCCESSFUL', 'COMPLETED'].includes((item.status ?? '').trim().toUpperCase())
      && (item.erpUpdated === false || item.erpUpdated === 0)
      && item.vch_id != null && !!item.srcAcctNumber;
  }

  loadPayments(): void {
    if (this.isLoading || this.isUpdating) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedPayments.clear();
    this.api.list(this.provider.companyInfo?.company?.branch_id || '')
      .pipe(finalize(() => { this.isLoading = false; }), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (payments) => { this.payments = (payments ?? []).filter((item) => this.canUpdate(item)); },
        error: () => {
          this.payments = [];
          this.errorMessage = 'Unable to load payments awaiting ERP update. Please refresh and try again.';
        },
      });
  }

  get filteredPayments(): ErpPayment[] {
    const query = this.searchTerm.trim().toLowerCase();
    return this.payments.filter((item) => !query || [item.payment_no, item.doc_no,
      item.srcAcctNumber, item.utr, item.vch_no, item.firm_id, item.branch_id,
    ].some((value) => String(value ?? '').toLowerCase().includes(query)));
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.selectedPayments.clear();
  }

  get allSelected(): boolean {
    const visible = this.filteredPayments;
    return visible.length > 0 && visible.every((item) => this.selectedPayments.has(item));
  }

  toggleAll(event: Event): void {
    if (this.isLoading || this.isUpdating) return;
    const checked = (event.target as HTMLInputElement).checked;
    this.filteredPayments.forEach((item) => {
      if (checked && this.canUpdate(item)) this.selectedPayments.add(item);
      else this.selectedPayments.delete(item);
    });
  }

  toggleSelection(item: ErpPayment): void {
    if (this.isLoading || this.isUpdating || !this.canUpdate(item)) return;
    if (this.selectedPayments.has(item)) this.selectedPayments.delete(item);
    else this.selectedPayments.add(item);
  }

  updateErp(): void {
    if (this.isLoading || this.isUpdating) return;
    const selected = this.payments.filter((item) => this.selectedPayments.has(item) && this.canUpdate(item));
    if (!selected.length) return;
    this.isUpdating = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.api.update(selected)
      .pipe(finalize(() => { this.isUpdating = false; }), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const results = Array.isArray(response) ? response : response ? [response] : [];
          const byNumber = new Map(results.map((item) => [String(item.payment_no), item]));
          let updated = 0;
          selected.forEach((item) => {
            const result = (item.payment_no ? byNumber.get(String(item.payment_no)) : undefined)
              ?? byNumber.get(`VCH-${item.vch_id}`);
            const confirmed = result?.erpUpdated === true || result?.erpUpdated === 1
              || (result?.erpUpdated == null && result?.erpResponse?.status_cd === 1);
            if (confirmed) {
              item.erpUpdated = true;
              this.selectedPayments.delete(item);
              updated++;
            } else {
              item.message = result?.erpResponse?.errors?.message || result?.message || (result
                ? 'ERP update was not confirmed. You can retry the ERP update.'
                : 'No ERP update result returned for this payment.');
            }
          });
          this.payments = this.payments.filter((item) => this.canUpdate(item));
          if (updated) this.successMessage = `ERP updated for ${updated} payment(s).`;
          if (updated < selected.length) this.errorMessage = 'Some ERP updates were not confirmed. Review the messages and retry.';
        },
        error: () => {
          this.errorMessage = 'Unable to confirm the ERP update. Refresh the list before retrying.';
          this.selectedPayments.clear();
        },
      });
  }
}
