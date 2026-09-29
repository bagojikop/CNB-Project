import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { Http } from '@shared-services/httpService';
import { apiResponse } from '@shared-interfaces/commans/apiResponse';

export interface VpaCreationData {
  mid: string; channel: string; account_number: string; mobile_number: string;
  terminalId: string; name: string; bank_name: string; mcc: string;
  ifsc_code: string; checksum: string; additionalNo: string; sid: string;
}

export interface VpaAccountRow {
  id: number | null;
  status: string;
  data: VpaCreationData;
  upiId: string;
  deactivated: boolean;
  deactivating: boolean;
  pending: boolean;
  created: boolean;
  message: string;
  error: boolean;
}

export interface VPACreate {
  Request: { body: { encryptData: VpaCreationData } };
}

export interface VPADeactivation {
  Request: { body: { encryptData: {
    channel: string; upiId: string; mid: string; terminalId: string; sid: string; checksum: string;
  } } };
}

export function toVpaAccount(account: Record<string, unknown>): VpaAccountRow {
  const value = (...keys: string[]): string => {
    for (const key of keys) {
      const candidate = account[key];
      if ((typeof candidate === 'string' || typeof candidate === 'number') && String(candidate).trim()) {
        return String(candidate).trim();
      }
    }
    return '';
  };
  const id = Number(value('id'));
  return {
    id: Number.isInteger(id) && id > 0 ? id : null,
    status: '',
    data: {
      mid: value('mid', 'merchId', 'merchid', 'merchantId'),
      channel: value('channel'),
      account_number: value('account_number', 'accountNo'),
      mobile_number: value('mobile_number', 'mobileNo', 'mobile_no'),
      terminalId: value('terminalId'),
      name: value('name', 'accountName'),
      bank_name: value('bank_name', 'bankName', 'accountName'),
      mcc: value('mcc'),
      ifsc_code: value('ifsc_code', 'ifsc_Code'),
      checksum: value('checksum'),
      additionalNo: value('additionalNo'),
      sid: value('sid'),
    },
    upiId: value('upiId', 'upi_id', 'vpa', 'vpaId'),
    deactivated: false, deactivating: false,
    pending: false, created: !!value('upiId', 'upi_id', 'vpa', 'vpaId'), message: '', error: false,
  };
}

@Component({
  selector: 'app-vpa-creation',
  imports: [RouterLink],
  templateUrl: './vpa-creation.component.html',
})
export class VpaCreationComponent implements OnInit {
  private readonly http = inject(Http);
  private readonly destroyRef = inject(DestroyRef);
  readonly deactivationMode = inject(ActivatedRoute, { optional: true })?.snapshot.data['deactivation'] === true;
  rows: VpaAccountRow[] = [];
  selectedBankId: number | null = null;
  banks: { id: number; label: string }[] = [];

  get visibleRows(): VpaAccountRow[] {
    return this.selectedBankId === null ? [] : this.rows.filter(row => row.id === this.selectedBankId);
  }

  selectBank(value: string): void {
    this.selectedBankId = value ? Number(value) : null;
  }
  loading = false;
  loadError = '';

  get busy(): boolean { return this.loading || this.rows.some(row => row.pending); }

  ngOnInit(): void { this.loadAccounts(); }

  loadAccounts(): void {
    if (this.busy) return;
    this.loading = true;
    this.loadError = '';
    forkJoin({
      accounts: this.http.get<apiResponse | Record<string, unknown>[]>('bankAccount/all'),
      registrations: this.http.get<apiResponse>('portal/vpa/registrations'),
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading = false),
    ).subscribe({
      next: ({ accounts: response, registrations }) => {
        if (registrations.status_cd !== 1 || !Array.isArray(registrations.data)) {
          this.loadError = 'Unable to load saved VPAs. Please try again.';
          return;
        }
        if (!Array.isArray(response) && response.status_cd !== undefined && response.status_cd !== 1) {
          this.loadError = response.errors?.message || 'Unable to load bank accounts.';
          return;
        }
        const accounts = Array.isArray(response) ? response : response.data;
        if (!Array.isArray(accounts)) {
          this.loadError = 'Unable to read the bank account list.';
          return;
        }
        this.rows = accounts.filter(account => account && typeof account === 'object').flatMap(account => {
          const row = toVpaAccount(account);
          const accountNumbers = row.data.account_number.split(',').map(number => number.trim()).filter(Boolean);
          return (accountNumbers.length ? accountNumbers : ['']).map(accountNumber => ({
            ...row,
            data: { ...row.data, account_number: accountNumber },
          }));
        });
        this.banks = [...new Map(this.rows.filter(row => row.id !== null).map(row => [row.id!, {
          id: row.id!,
          label: `${row.data.bank_name || 'Bank'}${row.data.account_number ? ' — ' + row.data.account_number : ''}`,
        }])).values()];
        if (!this.banks.some(bank => bank.id === this.selectedBankId)) this.selectedBankId = null;
        for (const row of this.rows) {
          // The API returns newest first. Match both ID and the individual account number.
          const saved = registrations.data.find((item: any) =>
            Number(item.bankAccountId) === row.id && item.accountNumber === row.data.account_number);
          if (!saved) continue;
          const savedData = saved.request?.Request?.body?.encryptData ?? saved.request?.request?.body?.encryptData;
          if (savedData) row.data = { ...row.data, ...toVpaAccount(savedData).data, account_number: row.data.account_number };
          row.upiId = saved.upiId ?? '';
          row.status = saved.status ?? '';
          row.created = saved.status !== 'Failed';
          row.deactivated = saved.status === 'Deactivated';
        }
      },
      error: () => this.loadError = 'Unable to load bank accounts. Please try again.',
    });
  }

  missingDetails(row: VpaAccountRow): string {
    const required: [keyof VpaCreationData, string][] = [
      ['bank_name', 'bank name'], ['account_number', 'account number'],
      ['mcc', 'MCC'], ['sid', 'SID'], ['mid', 'merchant ID'],
    ];
    return required.filter(([key]) => !row.data[key].trim()).map(([, label]) => label).join(', ');
  }

  canCreate(row: VpaAccountRow): boolean {
    return row.id !== null && !this.loading && !row.pending && !row.created && !row.upiId && !this.missingDetails(row);
  }

  canDeactivate(row: VpaAccountRow): boolean {
    return row.id !== null && !this.loading && !row.pending && !row.deactivated && (!row.status || row.status === 'Active') && !!row.upiId.trim();
  }

  deactivate(row: VpaAccountRow): void {
    if (!this.canDeactivate(row)) return;
    row.pending = true;
    row.deactivating = true;
    row.message = '';
    row.error = false;
    const { channel, mid, terminalId, sid, checksum } = row.data;
    const request: VPADeactivation = {
      Request: { body: { encryptData: { channel, upiId: row.upiId, mid, terminalId, sid, checksum } } },
    };
    this.http.post<apiResponse>('portal/vpa/upi-vpa-deactivation', request, { id: row.id! }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => { row.pending = false; row.deactivating = false; }),
    ).subscribe({
      next: response => {
        row.error = response?.status_cd !== 1;
        if (!row.error) { row.deactivated = true; row.status = 'Deactivated'; }
        row.message = row.error
          ? response?.errors?.message || 'VPA deactivation failed. Please try again.'
          : 'VPA deactivated successfully.';
      },
      error: () => {
        row.error = true;
        row.message = 'Unable to confirm VPA deactivation. Check the account status before trying again.';
      },
    });
  }

  create(row: VpaAccountRow): void {
    if (!this.canCreate(row)) return;
    row.pending = true;
    row.message = '';
    row.error = false;
    const request: VPACreate = { Request: { body: { encryptData: { ...row.data } } } };
    this.http.post<any>('vpa/upi-vpa-creation', request, { id: row.id! }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: response => {
        row.pending = false;
        const result = response?.Response?.body?.encryptData ?? response?.response?.body?.encryptData;
        const status = String(result?.status ?? '').trim().toUpperCase();
        const code = String(result?.respCode ?? '').trim();
        const errorCode = String(result?.response?.error_code ?? '').trim();
        const success = !!result && (!errorCode || ['0', '00'].includes(errorCode))
          && (!code || ['0', '00'].includes(code))
          && (status ? ['SUCCESS', 'SUCCESSFUL'].includes(status) : ['0', '00'].includes(code));
        if (!success) {
          row.error = true;
          row.message = result?.respMessge || response?.errors?.message || 'VPA creation was not confirmed. No record was saved.';
          return;
        }
        row.created = true;
        row.upiId = result.response?.upiId ?? result.upiId ?? '';
        row.status = row.upiId ? 'Active' : 'Pending';
        row.message = 'VPA created and saved successfully.';
      },
      error: error => {
        row.pending = false;
        row.error = true;
        if (error?.error?.bankCreated === true) {
          row.created = true;
          row.status = 'Save failed';
        }
        row.message = error?.error?.errors?.message || 'Unable to confirm VPA creation. Check the account status before trying again.';
      },
    });
  }

}
