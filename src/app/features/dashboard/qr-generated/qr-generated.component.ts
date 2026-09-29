import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Http } from '@shared-services/httpService';

export interface GeneratedQr {
  batch_id: number; bank_id: number; param1: string; param2: string; param3: string;
  extTransactionId: string; amount: number; remark?: string; type: 'D' | 'S';
  qrString: string; upiId?: string; status?: string; createdAt: string;
}

@Component({
  selector: 'app-qr-generated',
  imports: [RouterLink, DatePipe, DecimalPipe],
  templateUrl: './qr-generated.component.html',
})
export class QrGeneratedComponent implements OnInit {
  private readonly http = inject(Http);
  private readonly destroyRef = inject(DestroyRef);
  banks: { id: number; label: string }[] = [];
  bankId: number | null = null;
  rows: GeneratedQr[] = [];
  loadingBanks = false;
  loading = false;
  bankError = '';
  error = '';
  page = 1;
  readonly pageSize = 25;
  total = 0;
  expandedId: number | null = null;
  private requestVersion = 0;
  get pageCount(): number { return Math.max(1, Math.ceil(this.total / this.pageSize)); }

  ngOnInit(): void { this.loadBanks(); }

  loadBanks(): void {
    if (this.loadingBanks) return;
    this.loadingBanks = true;
    this.bankError = '';
    this.http.get<any>('bankAccount/all').pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.loadingBanks = false),
    ).subscribe({
      next: result => {
        const accounts = Array.isArray(result) ? result : result?.data;
        if (!Array.isArray(accounts) || (!Array.isArray(result) && result.status_cd !== undefined && result.status_cd !== 1)) {
          this.bankError = 'Unable to load banks.';
          return;
        }
        this.banks = accounts.filter(account => Number.isInteger(Number(account.id)) && Number(account.id) > 0)
          .map(account => ({ id: Number(account.id), label: account.bankName || account.bank_name || account.accountName || `Bank ${account.id}` }));
      },
      error: () => this.bankError = 'Unable to load banks. Please try again.',
    });
  }

  selectBank(value: string): void {
    this.bankId = this.banks.some(bank => bank.id === Number(value)) ? Number(value) : null;
    this.loadPage(1);
  }

  loadPage(page = this.page): void {
    const version = ++this.requestVersion;
    this.rows = [];
    this.expandedId = null;
    this.error = '';
    this.total = 0;
    this.page = page;
    if (this.bankId === null) { this.loading = false; return; }
    this.loading = true;
    this.http.get<any>('portal/upi-qr/generated', { id: this.bankId, page, pageSize: this.pageSize }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { if (version === this.requestVersion) this.loading = false; }),
    ).subscribe({
      next: result => {
        if (version !== this.requestVersion) return;
        if (result?.status_cd !== 1 || !Array.isArray(result.data)) {
          this.error = result?.errors?.message || 'Unable to load generated QR records.';
          return;
        }
        this.rows = result.data;
        this.total = result.total ?? result.data.length;
      },
      error: () => {
        if (version === this.requestVersion) this.error = 'Unable to load generated QR records. Please try again.';
      },
    });
  }

  part(value: string, index: number): string { return value?.split('|')[index] || '—'; }
}
