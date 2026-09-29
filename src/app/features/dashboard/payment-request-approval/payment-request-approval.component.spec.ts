import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Http } from '@shared-services/httpService';
import { MyProvider } from '@shared-services/provider';
import { PaymentRequestApprovalComponent } from './payment-request-approval.component';

describe('PaymentRequestApprovalComponent', () => {
  let component: PaymentRequestApprovalComponent;
  let http: jasmine.SpyObj<Http>;

  beforeEach(() => {
    http = jasmine.createSpyObj<Http>('Http', ['post', 'get', 'readJson']);
    TestBed.configureTestingModule({
      providers: [
        { provide: Http, useValue: http },
        { provide: MyProvider, useValue: {} },
      ],
    });
    component = TestBed.runInInjectionContext(() => new PaymentRequestApprovalComponent());
    component.approvalData = [24, 25].map((id) => ({
      vch_id: id, payment_no: `PAY-${id}`, paymentType: 'Single',
      srcAcctNumber: '123', status: 'Pending',
    }));
    component.selectedSingleItems = new Set([24, 25]);
  });

  it('allows approval again after loading a null status with an error message', () => {
    http.get.and.returnValue(of([{
      vch_id: 24, payment_no: 'PAY-24', srcAcctNumber: '123',
      status: null, error_message: 'Previous attempt could not be processed',
    }]));
    http.readJson.and.returnValue(of([]));
    http.post.and.returnValue(of({ payment_no: 'PAY-24', status: 'SUCCESS' }));

    component.ngOnInit();
    expect(component.approvalData[0].status).toBe('Pending');
    expect(component.approvalData[0].message).toBe('Previous attempt could not be processed');
    component.toggleAllSelections({ target: { checked: true } });
    expect(component.allSelected).toBeTrue();
    component.createPayments();
    expect(http.post).toHaveBeenCalledWith('SinglePaymentRequest/create', [
      { vch_id: 24, accountNo: '123' },
    ]);
    expect(component.paymentResults[0].status).toBe('SUCCESS');
  });

  it('keeps explicitly failed payments blocked from approval', () => {
    http.get.and.returnValue(of([{
      vch_id: 24, payment_no: 'PAY-24', srcAcctNumber: '123',
      status: 'Failed', error_message: 'Payment failed',
    }]));
    http.readJson.and.returnValue(of([]));
    component.ngOnInit();
    component.toggleSingleSelection(24);
    component.createPayments();
    expect(component.approvalData[0].status).toBe('Failed');
    expect(http.post).not.toHaveBeenCalled();
  });
  it('matches rejection voucher references even when responses are reordered', () => {
    http.post.and.returnValue(of([
      { payment_no: 'VCH-25', status: 'REJECTED' },
      { payment_no: 'VCH-24', status: 'REJECTED' },
    ]));
    component.rejectPayments();
    expect(http.post).toHaveBeenCalledWith('SinglePaymentRequest/reject', [
      { vch_id: 24, accountNo: '123' }, { vch_id: 25, accountNo: '123' },
    ]);
    expect(component.paymentResults.map((result) => result.payment_no)).toEqual(['VCH-24', 'VCH-25']);
    expect(component.paymentResults.every((result) => result.status === 'REJECTED' && result.message === null)).toBeTrue();
    expect(component.selectedSingleItems.size).toBe(0);
    component.backToPayments();
    expect(component.approvalData).toEqual([]);
  });

  it('keeps missing results unmatched in a partial rejection response', () => {
    http.post.and.returnValue(of([{ payment_no: 'VCH-24', status: 'REJECTED' }]));
    component.rejectPayments();
    expect(component.paymentResults[0].status).toBe('REJECTED');
    expect(component.paymentResults[1].message).toBe('No result returned for this payment.');
    expect([...component.selectedSingleItems]).toEqual([25]);
    component.backToPayments();
    expect(component.approvalData.map((item) => item.vch_id)).toEqual([25]);
  });

  it('continues matching creation responses by payment number', () => {
    http.post.and.returnValue(of({ payment_no: 'PAY-24', status: 'SUCCESS', utr: 'UTR24' }));
    component.createPayments();
    expect(component.paymentResults[0].status).toBe('SUCCESS');
    expect(component.paymentResults[0].utr).toBe('UTR24');
    expect(component.paymentResults[1].status).toBe('No response');
  });

  it('continues matching rejection responses by payment number', () => {
    http.post.and.returnValue(of({ payment_no: 'PAY-24', status: 'REJECTED' }));
    component.rejectPayments();
    expect(component.paymentResults[0].status).toBe('REJECTED');
    expect(component.paymentResults[0].message).toBeNull();
  });
});
