import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { Http } from '@shared-services/httpService';
import { MyProvider } from '@shared-services/provider';
import { PaymentErpUpdateComponent } from './payment-erp-update.component';
import { ErpPayment } from './payment-erp-update.service';

describe('PaymentErpUpdateComponent', () => {
  let component: PaymentErpUpdateComponent;
  let http: jasmine.SpyObj<Http>;
  const payment = (id: number, overrides: Partial<ErpPayment> = {}): ErpPayment => ({
    vch_id: id, vch_no: id, payment_no: `PAY-${id}`, firm_id: 1, branch_id: 'BR', challan_id: id,
    srcAcctNumber: '123', customerId: 'CUSTOMER', doc_no: `DOC-${id}`,
    doc_dt: '2026-09-24T00:00:00', json_script: '{}',
    status: 'SUCCESS', erpUpdated: false, utr: `UTR-${id}`, ...overrides,
  });

  beforeEach(() => {
    http = jasmine.createSpyObj<Http>('Http', ['get', 'post']);
    http.get.and.returnValue(of({ status_cd: 1, data: [payment(24), payment(25)] }));
    TestBed.configureTestingModule({
      providers: [
        { provide: Http, useValue: http },
        { provide: MyProvider, useValue: { companyInfo: { company: { branch_id: 'BR' } } } },
      ],
    });
    component = TestBed.runInInjectionContext(() => new PaymentErpUpdateComponent());
    component.ngOnInit();
  });

  it('loads successful payments for the branch from the status endpoint', () => {
    expect(http.get).toHaveBeenCalledOnceWith('SinglePaymentRequest/status-requests', { branch_id: 'BR', status: 'SUCCESS' });
    expect(component.payments.map((item) => item.vch_id)).toEqual([24, 25]);
    expect(component.payments[0].erpUpdated).toBeFalse();
    expect(component.payments[0].doc_no).toBe('DOC-24');
  });

  it('accepts a plain list and excludes updated or unsuccessful payments', () => {
    http.get.and.returnValue(of([
      payment(1), payment(2, { status: ' completed ', erpUpdated: 0 }),
      payment(3, { erpUpdated: true }), payment(4, { erpUpdated: 1 }),
      payment(5, { status: 'FAILED' }), payment(6, { status: 'PENDING' }),
      payment(7, { status: null }), payment(8, { erpUpdated: null }),
      payment(9, { erpUpdated: undefined }), payment(10, { status: 'APPROVED' }),
    ]));
    component.loadPayments();
    expect(component.payments.map((item) => item.vch_id)).toEqual([1, 2]);
  });

  it('searches the supplied entity fields', () => {
    component.onSearchChange('DOC-24');
    expect(component.filteredPayments.map((item) => item.vch_id)).toEqual([24]);
    component.onSearchChange('UTR-25');
    expect(component.filteredPayments.map((item) => item.vch_id)).toEqual([25]);
  });

  it('handles failure envelopes and invalid response data without keeping stale rows', () => {
    http.get.and.returnValue(of({ status_cd: 0, errors: { message: 'Query failed' } }));
    component.loadPayments();
    expect(component.payments).toEqual([]);
    expect(component.errorMessage).toContain('Unable to load');
    expect(component.isLoading).toBeFalse();
    http.get.and.returnValue(of({ status_cd: 1, data: {} }));
    component.loadPayments();
    expect(component.errorMessage).toContain('Unable to load');
  });

  it('ignores duplicate refreshes while loading and recovers from network errors', () => {
    const pending = new Subject<ErpPayment[]>();
    http.get.and.returnValue(pending);
    component.loadPayments();
    component.loadPayments();
    expect(http.get).toHaveBeenCalledTimes(2);
    pending.next([]);
    pending.complete();
    expect(component.isLoading).toBeFalse();
    http.get.and.returnValue(throwError(() => new Error('offline')));
    component.loadPayments();
    expect(component.payments).toEqual([]);
    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toContain('Unable to load');
  });
  it('posts documents and confirms ERP success from reordered wrapped results', () => {
    const original = component.payments[0];
    component.payments.forEach((item) => component.toggleSelection(item));
    http.post.and.returnValue(of({ status_cd: 1, data: [
      { payment_no: 'PAY-25', status: 'SUCCESS', erpResponse: { status_cd: 1 } },
      { payment_no: 'PAY-24', status: 'SUCCESS', erpResponse: { status_cd: 1 } },
    ] }));
    component.updateErp();
    expect(http.post).toHaveBeenCalledOnceWith('SinglePaymentRequest/single-payment-reUpdate', [
      { vch_id: 24, accountNo: '123' }, { vch_id: 25, accountNo: '123' },
    ]);
    expect(component.payments).toEqual([]);
    expect(component.selectedPayments.size).toBe(0);
    expect(original.status).toBe('SUCCESS');
    expect(original.utr).toBe('UTR-24');
    expect(component.successMessage).toContain('2');
  });

  it('matches missing-record failures by voucher reference and retains missing results', () => {
    component.payments.forEach((item) => component.toggleSelection(item));
    http.post.and.returnValue(of({ status_cd: 1, data: [
      { payment_no: 'VCH-24', status: 'Failed', message: 'Payment record not found' },
    ] }));
    component.updateErp();
    expect(component.payments[0].message).toBe('Payment record not found');
    expect(component.payments[1].message).toContain('No ERP update result');
    expect(component.selectedPayments.size).toBe(2);
    expect(component.payments[0].status).toBe('SUCCESS');
  });

  it('does not infer ERP completion from bank success or the outer success envelope', () => {
    component.payments.forEach((item) => component.toggleSelection(item));
    http.post.and.returnValue(of({ status_cd: 1, data: [
      { payment_no: 'PAY-24', status: 'SUCCESS' },
      { payment_no: 'PAY-25', status: 'SUCCESS', erpResponse: { status_cd: 0, errors: { message: 'ERP unavailable' } } },
    ] }));
    component.updateErp();
    expect(component.payments.length).toBe(2);
    expect(component.payments[1].message).toBe('ERP unavailable');
    expect(component.errorMessage).toContain('not confirmed');
  });

  it('honors explicit ERP flags and retains partial failures for retry', () => {
    component.payments.forEach((item) => component.toggleSelection(item));
    http.post.and.returnValue(of([
      { payment_no: 'PAY-24', erpUpdated: true },
      { payment_no: 'PAY-25', erpUpdated: false, erpResponse: { status_cd: 1 } },
    ]));
    component.updateErp();
    expect(component.payments.map((item) => item.vch_id)).toEqual([25]);
    http.post.and.returnValue(of({ payment_no: 'PAY-25', erpResponse: { status_cd: 1 } }));
    component.updateErp();
    expect(component.payments).toEqual([]);
  });

  it('blocks duplicate updates and keeps rows after a failure envelope', () => {
    const pending = new Subject<any>();
    http.post.and.returnValue(pending);
    component.toggleSelection(component.payments[0]);
    component.updateErp();
    component.updateErp();
    component.loadPayments();
    component.toggleSelection(component.payments[1]);
    expect(http.post).toHaveBeenCalledTimes(1);
    expect(http.get).toHaveBeenCalledTimes(1);
    expect(component.selectedPayments.size).toBe(1);
    pending.next({ status_cd: 0, errors: { message: 'ERP unavailable' } });
    expect(component.payments.length).toBe(2);
    expect(component.isUpdating).toBeFalse();
    expect(component.errorMessage).toContain('Unable to confirm');
  });
});