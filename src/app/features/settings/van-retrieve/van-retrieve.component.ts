import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';
import { Http } from '@shared-services/httpService';
import { MyProvider } from '@shared-services/provider';
import { EMPTY, expand, finalize, map } from 'rxjs';

interface FirmAccount {
  id: number | string;
  firmId: number;
  firmName: string;
  selectionLabel: string;
  accountNos: string[];
  customerId: string;
  branchId?: string;
  branch_id?: string;
}
interface VanDetail { Van: string; VanStartDate: string; VanEndDate: string; }
interface RetrievalPage {
  CasaAccountNo: string;
  fromDate: string;
  toDate: string;
  TotalNoOfPages: string;
  TotalNoOfRecords: string;
  pageNo: string;
  VanTxnDetailsDTO: VanDetail[];
}
@Component({
  selector: 'app-van-retrieve',
  imports: [RouterLink, CommonModule, ReactiveFormsModule, DSS_FORM_CONTROLS],
  templateUrl: './van-retrieve.component.html',
  styleUrl: './van-retrieve.component.scss',
})
export class VanRetrieveComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(Http);
  private readonly provider = inject(MyProvider);
  private readonly destroyRef = inject(DestroyRef);
  readonly apiUrl = 'van/retrieve-van';
  firms: FirmAccount[] = [];
  selectedFirm: FirmAccount | null = null;
  isLoading = false;
  loadingAccounts = false;
  updatingPortal = false;
  portalUpdated = false;
  portalMessage = '';
  portalError = '';
  retrievalComplete = false;
  private retrievalContext: { firm_id: number; branch_id: string; customerId: string } | null = null;
  errorMessage = '';
  errorResponseJson = '';
  rows: VanDetail[] = [];
  summary: RetrievalPage | null = null;
  fetchedPages = 0;
  totalApiPages = 0;
  currentPage = 1;
  readonly pageSize = 100;
  readonly filterForm = this.fb.group({
    firm_id: ['', Validators.required],
    accountNo: ['', Validators.required],
    fromDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  constructor() { this.loadFirmAccounts(); }

  loadFirmAccounts(): void {
    if (this.loadingAccounts || this.isLoading || this.updatingPortal) return;
    this.firms = [];
    this.selectedFirm = null;
    this.filterForm.controls.firm_id.setValue('');
    this.filterForm.controls.accountNo.setValue('');
    const branchId = this.provider.companyInfo?.company?.branch_id;
    this.loadingAccounts = true;
    this.errorMessage = '';
    this.errorResponseJson = '';
    this.http.get<any>('bankAccount/all', branchId == null || String(branchId).trim() === '' ? {} : { branch_id: branchId }).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loadingAccounts = false)).subscribe({
      next: response => {
        const accounts = response?.data ?? response;
        if (!Array.isArray(accounts)) {
          this.errorMessage = 'Unable to load firm accounts.';
          return;
        }
        this.firms = accounts
          .map(({ accountNo, ...firm }: any) => ({
          ...firm,
          selectionLabel: `${firm.firmName} ? ${firm.customerId ?? firm.customerID ?? ''}`,
          customerId: String(firm.customerId ?? firm.customerID ?? '').trim(),
          accountNos: String(accountNo ?? '').split(',').map(value => value.trim()).filter(Boolean),
        }));
      },
      error: () => this.errorMessage = 'Unable to load firm accounts. Please retry.',
    });
  }

  onFirmSelect(firm: FirmAccount | null): void {
    this.selectedFirm = this.firms.find(account => String(account.id) === String(firm?.id)) ?? null;
    this.filterForm.controls.accountNo.setValue('');
  }

  showResult(): void {
    if (this.isLoading || this.updatingPortal) return;
    if (this.filterForm.invalid || !this.selectedFirm) {
      this.filterForm.markAllAsTouched();
      this.errorMessage = 'Select a firm, account, and date range.';
      return;
    }
    const { accountNo, fromDate, endDate } = this.filterForm.getRawValue();
    if (!this.selectedFirm.accountNos.includes(accountNo!)) {
      this.errorMessage = 'Select an account belonging to the selected firm.';
      return;
    }
    if (!this.validDate(fromDate!) || !this.validDate(endDate!) || fromDate! > endDate!) {
      this.errorMessage = 'Enter valid dates with From on or before To.';
      return;
    }
    const customerID = this.selectedFirm.customerId;
    if (!customerID) {
      this.errorMessage = 'The selected account is missing its customer ID. Update the bank account details and retry.';
      return;
    }

    this.retrievalContext = {
      firm_id: Number(this.selectedFirm.firmId),
      branch_id: String(this.selectedFirm.branchId ?? this.selectedFirm.branch_id ?? this.provider.companyInfo?.company?.branch_id ?? '').trim(),
      customerId: customerID,
    };
    this.retrievalComplete = false;
    this.portalUpdated = false;
    this.portalMessage = '';
    this.portalError = '';
    const firmRecordId = this.selectedFirm.id;
    const requestDetails = {
      customerID,
      accountNo: accountNo!.split('|')[0].trim(),
      fromDate: fromDate!,
      toDate: endDate!,
      noOfTransactions: '1000',
    };
    this.rows = [];
    this.summary = null;
    this.fetchedPages = 0;
    this.totalApiPages = 0;
    this.currentPage = 1;
    this.errorMessage = '';
    this.errorResponseJson = '';
    this.isLoading = true;
    let requestedPage = 1;
    const fetchPage = (page: number) => {
      requestedPage = page;
      const payload = {
        Request: { body: { encryptData: { ...requestDetails, pageNo: String(page) } } },
      };
      return this.http.post<any>(this.apiUrl, payload, { id: firmRecordId }).pipe(
        map(res => {
          const root = res?.data ?? res;
          const response = root?.Response ?? root?.response ?? root;
          const encrypted = response?.body?.encryptData;
          const details = encrypted?.vanTxnDetailsDTO ?? encrypted?.VanTxnDetailsDTO;
          if (!Array.isArray(details)) {
            this.errorResponseJson = JSON.stringify(res, null, 2) ?? 'null';
            throw new Error('VAN details were not returned.');
          }
          const reportedPages = Number(encrypted.totalNoOfPages ?? encrypted.TotalNoOfPages);
          const pages = Number.isSafeInteger(reportedPages) && reportedPages >= page ? reportedPages : page;
          const returnedAccount = encrypted.casaAccountNo ?? encrypted.CasaAccountNo;
          const data: RetrievalPage = {
            CasaAccountNo: returnedAccount == null ? requestDetails.accountNo : String(returnedAccount).trim(),
            fromDate: encrypted.fromDate ?? requestDetails.fromDate,
            toDate: encrypted.toDate ?? requestDetails.toDate,
            TotalNoOfPages: String(pages),
            TotalNoOfRecords: String(encrypted.totalNoOfRecords ?? encrypted.TotalNoOfRecords ?? details.length),
            pageNo: String(page),
            VanTxnDetailsDTO: details.map((row: any): VanDetail => {
              const van = String(row?.van ?? row?.Van ?? '');
              return {
                Van: van.trim(),
                VanStartDate: row?.vanStartDate ?? row?.VanStartDate ?? '',
                VanEndDate: row?.vanEndDate ?? row?.VanEndDate ?? '',
              };
            }),
          };
          if (page === 1) this.totalApiPages = pages;

          return data;
        }),
      );
    };
    fetchPage(1).pipe(
      expand(data => Number(data.pageNo) < this.totalApiPages ? fetchPage(Number(data.pageNo) + 1) : EMPTY, 1),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading = false),
    ).subscribe({
      next: data => {
        this.summary = data;
        this.fetchedPages++;
        this.rows = [...this.rows, ...data.VanTxnDetailsDTO.map(row => ({ ...row, Van: row.Van.trim() }))];
      },
      complete: () => this.retrievalComplete = this.fetchedPages === this.totalApiPages,
      error: error => {
        if (!this.errorResponseJson && error?.error != null) {
          this.errorResponseJson = JSON.stringify(error.error, null, 2);
        }
        this.errorMessage = `Unable to fetch page ${requestedPage}. ${this.rows.length} records loaded; results are incomplete. Search again to retry.`;
      },
    });
  }

  get canUpdatePortal(): boolean {
    return this.retrievalComplete && !this.isLoading && !this.updatingPortal && !this.portalUpdated &&
      this.rows.length > 0 && !!this.retrievalContext &&
      Number.isInteger(this.retrievalContext.firm_id) && this.retrievalContext.firm_id > 0 &&
      !!this.retrievalContext.branch_id && !!this.retrievalContext.customerId;
  }

  updatePortal(): void {
    if (!this.canUpdatePortal || !this.summary || !this.retrievalContext) return;
    const payload = {
      body: {
        encryptData: {
          ...this.summary,
          TotalNoOfPages: '1',
          TotalNoOfRecords: String(this.rows.length),
          NoOfRecords: String(this.rows.length),
          EndOfStatement: 'Y',
          HasMoreResults: 'false',
          pageNo: '1',
          VanTxnDetailsDTO: this.rows.map(row => ({ ...row })),
        },
      },
    };
    this.updatingPortal = true;
    this.portalMessage = '';
    this.portalError = '';
    this.http.post<{ status: string; updatedCount: number }>('VanCreateRequest/update-vans', payload, { ...this.retrievalContext }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.updatingPortal = false),
    ).subscribe({
      next: response => {
        if (response?.status !== 'Success' || !Number.isInteger(response.updatedCount) || response.updatedCount < 0) {
          this.portalError = JSON.stringify(response, null, 2) ?? 'Portal update failed.';
          return;
        }
        this.portalUpdated = true;
        this.portalMessage = `Portal updated successfully. ${response.updatedCount} VAN(s) updated.`;
      },
      error: error => this.portalError = error?.error != null
        ? JSON.stringify(error.error, null, 2)
        : 'Unable to update the portal. Please retry.',
    });
  }

  private validDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  get totalPages(): number { return Math.max(1, Math.ceil(this.rows.length / this.pageSize)); }
  get pagedRows(): VanDetail[] { return this.rows.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize); }
  goToPage(page: number): void { this.currentPage = Math.min(Math.max(page, 1), this.totalPages); }
}
