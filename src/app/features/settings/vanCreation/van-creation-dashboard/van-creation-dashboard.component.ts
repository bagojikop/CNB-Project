import { Component, inject, OnInit } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';
import { CreateVANRequest, VirtualAccountDetail } from '@shared-interfaces/settings/van-creation';
import { Http } from '@shared-services/httpService';

interface PendingVANRequest {
  vch_id: number;
  srcAcctNumber: string;
  request_json: string;
  firm_id?: string | number;
  branch_id?: string | number;
  firm_name?: string;
  branch_name?: string;
  firmName?: string;
  branchName?: string;
}

interface VANRequestRow extends CreateVANRequest {
  firmName: string;
  branchName: string;
}

interface PendingVANResponse {
  status_cd: number;
  data?: PendingVANRequest[];
  errors?: { message?: string };
}

@Component({
  selector: 'app-van-creation-dashboard',
  imports: [RouterLink, JsonPipe, FormsModule],
  templateUrl: './van-creation-dashboard.component.html',
  styleUrl: './van-creation-dashboard.component.scss',
})
export class VanCreationDashboardComponent implements OnInit {
  private readonly http = inject(Http);
  private readonly router = inject(Router);
  jsonData: VANRequestRow[] = [];
  selected: VANRequestRow | null = null;
  startDate = this.today();
  expiryMonths: number | null = null;
  expiryDays: number | null = 0;
  loading = false;
  submitting = false;
  error = '';
  success = '';
  completed = new Set<string>();

  ngOnInit(): void { this.loadRequests(); }

  loadRequests(): void {
    this.loading = true;
    this.error = '';
    this.jsonData = [];
    this.selected = null;
    forkJoin({
      response: this.http.get<PendingVANResponse>('VanCreateRequest/pending-requests'),
      firms: this.http.readJson<Array<{ firm_code: string | number; firm_name: string }>>('assets/data/firms.json').pipe(catchError(() => of([]))),
      branches: this.http.readJson<Array<{ branch_code: string | number; branch_name: string }>>('assets/data/branches.json').pipe(catchError(() => of([]))),
    }).pipe(
      map(({ response, firms, branches }) => {
        if (response.status_cd !== 1 || !Array.isArray(response.data)) {
          throw new Error(response.errors?.message || 'Unable to load requests.');
        }
        return response.data.map((request): VANRequestRow => {
          const details: unknown = JSON.parse(request.request_json);
          if (!Array.isArray(details) || details.some(detail =>
            !detail || typeof detail.vanNumber !== 'string')) {
            throw new Error('Invalid VAN request details.');
          }
          return {
            id: String(request.vch_id),
            firmName: request.firm_name || request.firmName || firms.find(firm => String(firm.firm_code) === String(request.firm_id))?.firm_name || String(request.firm_id ?? '—'),
            branchName: request.branch_name || request.branchName || branches.find(branch => String(branch.branch_code) === String(request.branch_id))?.branch_name || String(request.branch_id ?? '—'),
            Request: {
              body: {
                encryptData: {
                  accountNo: request.srcAcctNumber,
                  startDate: '',
                  endDate: '',
                  countVAN: details.length,
                  virtualAccountDetails: details as VirtualAccountDetail[],
                }
              }
            },
          };
        });
      }),
      finalize(() => this.loading = false),
    ).subscribe({
      next: response => this.jsonData = response,
      error: () => this.error = 'Unable to load VAN creation requests. Please retry.',
    });
  }

  addVanCreation(): void { void this.router.navigate(['/settings-form/vanCreationEdit']); }

  count(request: CreateVANRequest): number {
    const data = request.Request.body.encryptData;
    return data.virtualAccountDetails?.length ?? (Number(data.countVAN) || 0);
  }

  get totalCount(): number { return this.jsonData.reduce((sum, item) => sum + this.count(item), 0); }

  selectRequest(request: VANRequestRow): void {
    if (this.submitting) return;
    this.selected = request;
    this.startDate = this.today();
    this.expiryMonths = null;
    this.expiryDays = 0;
    this.error = '';
    this.success = '';
  }

  private today(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  get endDate(): string {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(this.startDate) ||
      !Number.isInteger(this.expiryMonths) || this.expiryMonths! < 0 ||
      !Number.isInteger(this.expiryDays) || this.expiryDays! < 0 ||
      this.expiryMonths! + this.expiryDays! === 0) return '';
    const [year, month, day] = this.startDate.split('-').map(Number);
    const start = new Date(year, month - 1, day);
    if (start.getFullYear() !== year || start.getMonth() !== month - 1 || start.getDate() !== day) return '';
    const end = new Date(year, month - 1 + this.expiryMonths!, 1);
    end.setDate(Math.min(day, new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()));
    end.setDate(end.getDate() + this.expiryDays!);
    if (!Number.isFinite(end.getTime()) || end.getFullYear() > 9999) return '';
    return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
  }

  get payload() {
    if (!this.selected) return null;
    return {
      id: Number(this.selected.id),
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }

  submit(): void {
    if (!this.selected || !this.endDate || this.submitting || this.completed.has(this.selected.id)) return;
    const request = this.selected;
    this.submitting = true;
    this.error = '';
    this.success = '';
    this.http.post<unknown>('Van/create-van', this.payload).pipe(finalize(() => this.submitting = false)).subscribe({
      next: (res: any) => {
        if (!res.error) {
          this.completed.add(request.id);
          this.success = 'VAN creation submitted successfully.';
        }
        else
          this.error = 'VAN creation failed. Check the request and try again.'
      },
      error: () => this.error = 'VAN creation failed. Check the request and try again.',
    });
  }
}


