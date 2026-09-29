import { RouterLink } from '@angular/router';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, map } from 'rxjs';
import { Http } from '@shared-services/httpService';

export interface VANExpiyList {
  Id: number;
  endDate: string;
  firm_id: number;
  branch_id: string;
  srcAcctNumber: string;
  customerId: string;
  van: string;
}
interface VanModifiedResponse {
  van: string;
  response?: {
    response?: {
      body?: {
        encryptData?: {
          vanModifyResponse?: {
            status?: { replyCode?: string | number; replyText?: unknown };
          };
        };
      };
    };
  };
  error?: string | null;
}
interface VanModifiedRecord {
  Id?: number;
  id?: number;
  endDate: string;
  firm_id: number;
  branch_id: string;
  srcAcctNumber: string;
  customerId: string;
  VANResponse?: VanModifiedResponse[];
  vanResponse?: VanModifiedResponse[];
}
type ModifyResponse = VanModifiedRecord[];
interface ModificationResult {
  van: string;
  account: string;
  endDate: string;
  success: boolean;
  error: string | null;
}
interface ExpiryRow extends VANExpiyList {
  customerName: string;
  startDate: string;
  checked: boolean;
}
interface ApiResponse {
  status_cd?: number;
  data?: Record<string, unknown>[];
  errors?: { message?: string };
}
@Component({
  selector: 'app-van-modify',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './van-modify.component.html',
  styleUrl: './van-modify.component.scss',
})
export class VanModifyComponent implements OnInit {
  private readonly http = inject(Http);
  vanList: ExpiryRow[] = [];
  results: ModificationResult[] = [];
  loading = false;
  submitting = false;
  error = '';
  success = '';
  extensionDays: number | null = 0;
  extensionMonths: number | null = 0;
  ngOnInit(): void { this.loadRequests(); }
  loadRequests(): void {
    if (this.loading || this.submitting) return;
    this.loading = true;
    this.error = '';
    this.success = '';
    this.results = [];
    this.vanList = [];
    this.extensionDays = 0;
    this.extensionMonths = 0;
    this.http.get<ApiResponse | Record<string, unknown>[]>('VanCreateRequest/modify-requests').pipe(
      map(response => {
        const rows = Array.isArray(response) ? response : response.data;
        if ((!Array.isArray(response) && response.status_cd !== undefined && response.status_cd !== 1) || !Array.isArray(rows)) {
          throw new Error('Unable to load expiring VANs.');
        }
        return rows.map(row => ({
          Id: Number(row['vch_id'] ?? row['Id'] ?? row['id']),
          firm_id: Number(row['firm_id']),
          branch_id: String(row['branch_id'] ?? ''),
          srcAcctNumber: String(row['srcAcctNumber'] ?? ''),
          customerId: String(row['customerId'] ?? row['CustomerId'] ?? ''),
          van: String(row['VanNumber'] ?? row['vanNumber'] ?? row['van'] ?? ''),
          customerName: String(row['CustomerName'] ?? row['customerName'] ?? ''),
          startDate: this.dateOnly(row['StartDate'] ?? row['startDate']),
          endDate: this.dateOnly(row['EndDate'] ?? row['endDate']),
          checked: false,
        })).sort((a, b) => a.endDate.localeCompare(b.endDate));
      }),
      finalize(() => this.loading = false),
    ).subscribe({
      next: rows => this.vanList = rows,
      error: () => this.error = 'Unable to load expiring VANs. Please retry.',
    });
  }
  private dateOnly(value: unknown): string {
    const date = String(value ?? '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return '';
    const parsed = new Date(date + 'T00:00:00Z');
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date ? date : '';
  }
  get selectedVans(): ExpiryRow[] { return this.vanList.filter(row => row.checked); }
  get allSelected(): boolean { return this.vanList.length > 0 && this.vanList.every(row => row.checked); }
  toggleAll(checked: boolean): void {
    if (this.submitting) return;
    this.vanList.forEach(row => row.checked = checked);
    this.success = '';
  }
  get extensionBaseDate(): string {
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return this.selectedVans.reduce((date, row) => row.endDate > date ? row.endDate : date, localToday);
  }
  get endDate(): string {
    const months = this.extensionMonths ?? 0;
    const days = this.extensionDays ?? 0;
    if (!this.selectedVans.length || !Number.isInteger(months) || !Number.isInteger(days) ||
      months < 0 || days < 0 || months > 120000 || days > 3652059 || months + days === 0) return '';
    const base = new Date(this.extensionBaseDate + 'T00:00:00Z');
    const day = base.getUTCDate();
    base.setUTCDate(1);
    base.setUTCMonth(base.getUTCMonth() + months);
    const lastDay = new Date(base.getTime());
    lastDay.setUTCMonth(lastDay.getUTCMonth() + 1, 0);
    base.setUTCDate(Math.min(day, lastDay.getUTCDate()) + days);
    if (!Number.isFinite(base.getTime()) || base.getUTCFullYear() > 9999) return '';
    return base.toISOString().slice(0, 10);
  }
  get validationMessage(): string {
    const selected = this.selectedVans;
    if (!selected.length) return 'Select one or more VANs to extend.';
    if (selected.some(row => !Number.isInteger(row.Id) || row.Id <= 0 ||
      !Number.isInteger(row.firm_id) || row.firm_id <= 0 || !row.branch_id.trim() ||
      !row.srcAcctNumber.trim() || !row.customerId.trim() || !row.van.trim() || !row.endDate)) {
      return 'Selected VANs are missing required account details or expiry dates. Refresh the list or contact support.';
    }
    if (!this.endDate) return 'Enter non-negative whole months and days, with at least one greater than zero, within the supported date range.';
    return '';
  }
  submit(): void {
    if (this.loading || this.submitting || this.validationMessage) return;
    const selected = this.selectedVans;
    const payload: VANExpiyList[] = selected.map(row => ({
      Id: row.Id, endDate: this.endDate, firm_id: row.firm_id,
      branch_id: row.branch_id, srcAcctNumber: row.srcAcctNumber,
      customerId: row.customerId, van: row.van,
    }));
    this.submitting = true;
    this.error = '';
    this.success = '';
    this.results = [];
    this.http.post<ModifyResponse>('van/modify-van', payload).pipe(
      map(response => {
        if (!Array.isArray(response)) throw new Error('Invalid modification results.');
        return response;
      }),
      finalize(() => this.submitting = false),
    ).subscribe({
      next: records => {
        const succeeded = new Set<ExpiryRow>();
        this.results = selected.map((row, index) => {
          const record = records.find(item => Number(item.Id ?? item.id) === row.Id &&
            Number(item.firm_id) === row.firm_id && String(item.branch_id) === row.branch_id &&
            item.srcAcctNumber === row.srcAcctNumber && item.customerId === row.customerId &&
            (item.VANResponse ?? item.vanResponse ?? []).some(result => result.van === row.van));
          const result = (record?.VANResponse ?? record?.vanResponse ?? []).find(item => item.van === row.van);
          const status = result?.response?.response?.body?.encryptData?.vanModifyResponse?.status;
          const success = !!result && !result.error && String(status?.replyCode) === '0';
          const bankError = status?.replyCode != null && String(status.replyCode) !== '0'
            ? (typeof status.replyText === 'string' && status.replyText.trim()
              ? status.replyText : `Bank rejected modification (reply code ${status.replyCode}).`)
            : null;
          if (success) succeeded.add(row);
          return {
            van: row.van, account: row.srcAcctNumber, endDate: payload[index].endDate, success,
            error: success ? null : result?.error || bankError || 'No successful result returned for this VAN.',
          };
        });
        if (succeeded.size) this.success = `End date extended successfully for ${succeeded.size} VAN(s).`;
        const failed = selected.length - succeeded.size;
        if (failed) this.error = `${failed} VAN(s) failed. See the results below. Failed VANs remain selected for retry.`;
        this.vanList = this.vanList.filter(row => !succeeded.has(row));
        if (!failed) {
          this.extensionDays = 0;
          this.extensionMonths = 0;
        }
      },
      error: () => this.error = 'Unable to extend VAN end dates. Please check the request and retry.',
    });
  }
}
