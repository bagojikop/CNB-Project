import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Http } from '@shared-services/httpService';

export type ErpUpdatedFlag = boolean | 0 | 1 | null;

export interface ErpPayment {
  vch_id: number;
  vch_no?: number;
  firm_id?: number;
  branch_id?: string;
  challan_id?: number;
  payment_no?: string;
  srcAcctNumber: string | null;
  customerId?: string | null;
  doc_no: string | number;
  doc_dt?: string;
  json_script?: string;
  status: string | null;
  utr?: string | null;
  erpUpdated?: ErpUpdatedFlag;
  err_code?: string | null;
  error_message?: string | null;
  message?: string | null;
}

export interface ErpUpdateResult {
  payment_no: string;
  status?: string | null;
  erpUpdated?: ErpUpdatedFlag;
  message?: string | null;
  erpResponse?: { status_cd?: number; errors?: { message?: string }; } | null;
}

interface ApiResponse<T> {
  status_cd?: number;
  data?: T;
  errors?: { message?: string };
}

@Injectable({ providedIn: 'root' })
export class PaymentErpUpdateService {
  private http = inject(Http);
  private readonly controller = 'SinglePaymentRequest';

  private unwrap<T>(response: T | ApiResponse<T>): T {
    if (response && typeof response === 'object' && !Array.isArray(response)
      && ('status_cd' in response || 'data' in response)) {
      const envelope = response as ApiResponse<T>;
      if (envelope.status_cd != null && envelope.status_cd !== 1) {
        throw new Error(envelope.errors?.message || 'ERP request failed.');
      }
      if (envelope.data == null) throw new Error('Missing ERP response data.');
      return envelope.data;
    }
    return response as T;
  }

  list(branchId: string | number) {
    return this.http.get<ErpPayment[] | ApiResponse<ErpPayment[]>>(`${this.controller}/status-requests`, {
      branch_id: branchId, status: 'SUCCESS',
    }).pipe(map((response) => {
      const payments = this.unwrap(response);
      if (!Array.isArray(payments)) throw new Error('Invalid ERP payment list response.');
      return payments;
    }));
  }

  update(payments: ErpPayment[]) {
    return this.http.post<ErpUpdateResult[] | ErpUpdateResult | ApiResponse<ErpUpdateResult[] | ErpUpdateResult>>(
      `${this.controller}/single-payment-reUpdate`,
      payments.map((item) => ({ vch_id: item.vch_id, accountNo: item.srcAcctNumber })),
    ).pipe(map((response) => this.unwrap(response)));
  }
}