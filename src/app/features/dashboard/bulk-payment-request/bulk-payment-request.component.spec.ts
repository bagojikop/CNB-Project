import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { Http } from '@shared-services/httpService';
import { MyProvider } from '@shared-services/provider';
import { BulkPaymentRequestComponent } from './bulk-payment-request.component';

describe('BulkPaymentRequestComponent', () => {
  let component: BulkPaymentRequestComponent;
  let http: jasmine.SpyObj<Http>;

  beforeEach(() => {
    http = jasmine.createSpyObj<Http>('Http', ['get', 'readJson', 'post']);
    http.get.and.returnValue(of([
      { vch_id: 1, payment_no: 'B1', branch_id: 'BR', firm_id: 10, srcAcctNumber: '123', doc_no: 'DOC1' },
      { vch_id: 2, payment_no: 'B2', branch_id: 'BR', firm_id: 10, srcAcctNumber: '456', doc_no: 'DOC2' },
    ]));
    http.readJson.and.returnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        { provide: Http, useValue: http },
        { provide: MyProvider, useValue: { companyInfo: { company: { branch_id: 'BR' } } } },
      ],
    });
    component = TestBed.runInInjectionContext(() => new BulkPaymentRequestComponent());
    component.ngOnInit();
  });

  it('loads bulk requests and selects only search matches', () => {
    expect(http.get).toHaveBeenCalledWith('Dashoboard/maker-requests', { branch_id: 'BR' });
    component.onSearchChange('DOC2');
    component.toggleAllSelections({ target: { checked: true } });
    expect([...component.selectedBulkItems]).toEqual([2]);
    component.onSearchChange('');
    expect(component.selectedBulkItems.size).toBe(0);
  });

  it('maps the maker response into a batch and opens its account details', () => {
    const txn = { txnIdentity: { id: 1001, srNo: '1' }, txnAmt: '500.00', txnType: 'IFT',
      benefIFSC: 'CNRB0006474', benefAcNo: '6474201000016', benefAcNm: 'TIRUMALA', nrtv: 'APITEST' };
    http.get.and.returnValue(of({ status_cd: 1, errors: {}, data: [
      { vch_id: 3, batch_no: '10110200000003', branch_id: '102', firm_id: 101,
        srcAcctNumber: '6474201000015', doc_no: '1234', total_amt: 1000,
        txnDetls: [txn, { ...txn, txnIdentity: { id: 1002, srNo: '2' } }] },
    ] }));
    component.ngOnInit();
    expect(component.approvalData[0].request_count).toBe(2);
    expect(component.approvalData[0].total_amt).toBe(1000);
    expect(component.approvalData[0].narration).toBe('APITEST');
    component.onSearchChange('6474201000016');
    expect(component.filteredData.length).toBe(1);
    component.toggleRequestDetails(component.filteredData[0]);
    expect(component.expandedRequests.has(3)).toBeTrue();
    component.toggleRequestDetails(component.filteredData[0]);
    expect(component.expandedRequests.has(3)).toBeFalse();
  });

  it('shows an error when the maker API reports failure', () => {
    http.get.and.returnValue(of({ status_cd: 0, errors: {}, data: [] }));
    component.ngOnInit();
    expect(component.approvalData).toEqual([]);
    expect(component.loadError).toBeTruthy();
    expect(component.isLoading).toBeFalse();
  });

  it('submits selected documents once and matches results by payment number', () => {
    const response = new Subject<any>();
    http.post.and.returnValue(response);
    component.toggleBulkSelection(1);
    component.toggleBulkSelection(2);
    component.createPayments();
    component.createPayments();
    expect(http.post).toHaveBeenCalledOnceWith('BulkPaymentRequest/create', [
      { vch_id: 1, accountNo: '123' }, { vch_id: 2, accountNo: '456' },
    ]);
    response.next([
      { payment_no: 'B2', status: 'FAILED', utr: '', message: 'Failed' },
      { payment_no: 'B1', status: 'SUCCESS', utr: 'UTR1', message: 'Done' },
    ]);
    response.complete();
    expect(component.paymentResults.map(result => result.status)).toEqual(['SUCCESS', 'FAILED']);
    expect(component.isSubmitting).toBeFalse();
    component.backToPayments();
    expect(component.approvalData.map(item => item.vch_id)).toEqual([2]);
  });

  it('allows failed payments to be rejected but not pushed', () => {
    component.approvalData[0].status = 'FAILED';
    component.toggleBulkSelection(1);
    component.createPayments();
    expect(http.post).not.toHaveBeenCalled();
    http.post.and.returnValue(of({ payment_no: 'B1', status: 'REJECTED', utr: '', message: 'Rejected' }));
    component.rejectPayments();
    expect(http.post).toHaveBeenCalledOnceWith('BulkPaymentRequest/reject', [{ vch_id: 1, accountNo: '123' }]);
  });

  it('retains payments with unknown outcomes after a request error', () => {
    http.post.and.returnValue(throwError(() => new Error('Network error')));
    component.toggleBulkSelection(1);
    component.createPayments();
    expect(component.paymentResults[0].status).toBe('Unknown');
    expect(component.isSubmitting).toBeFalse();
    component.backToPayments();
    expect(component.approvalData.length).toBe(2);
  });
});
