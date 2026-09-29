import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { Http } from '@shared-services/httpService';
import { MyProvider } from '@shared-services/provider';
import { VanTransactionComponent } from './van-transaction.component';

describe('VanTransactionComponent', () => {
  let component: VanTransactionComponent;
  let http: jasmine.SpyObj<Http>;
  beforeEach(() => {
    http = jasmine.createSpyObj<Http>('Http', ['get', 'post']);
    http.get.and.returnValue(of([{ id: 7, firmName: 'Firm', accountNo: '00123', customerID: '00456' }]));
    http.post.and.returnValue(of({ Response: { body: { encryptData: { TransactionInquiryDetailsDTO: [], TotalNoOfPages: '2' } } } }));
    TestBed.configureTestingModule({ providers: [
      { provide: Http, useValue: http },
      { provide: MyProvider, useValue: { companyInfo: { company: { branch_id: '102' } } } },
    ] });
    component = TestBed.runInInjectionContext(() => new VanTransactionComponent());
    component.filterForm.patchValue({ bankId: '7', vanNo: ' VAN001 ',
      fromDate: '2026-09-01T00:00', toDate: '2026-09-22T23:59:59' });
  });

  it('sends the bank ID and exact enquiry fields with formatted timestamps', () => {
    component.showResult();
    expect(http.post).toHaveBeenCalledWith('van/get-van-transactions-with-van-no', {
      Request: { body: { encryptData: {
        customerID: '00456', vanNo: 'VAN001', fromDate: '2026-09-01 00:00:00',
        toDate: '2026-09-22 23:59:59', noOfTransactions: '100', pageNo: '1',
      } } },
    }, { id: 7 });
    expect(component.isLoading).toBeFalse();
    expect(component.showFilters).toBeFalse();
  });

  it('defaults to yesterday in local time and preserves end-of-day milliseconds', () => {
    jasmine.clock().install();
    try {
      jasmine.clock().mockDate(new Date(2026, 0, 1, 12));
      const defaults = TestBed.runInInjectionContext(() => new VanTransactionComponent());
      expect(defaults.filterForm.controls.fromDate.value).toBe('2025-12-31T01:00:00');
      expect(defaults.filterForm.controls.toDate.value).toBe('2025-12-31T23:59:59.999');
      defaults.filterForm.patchValue({ bankId: '7', vanNo: 'VAN001' });
      defaults.showResult();
      const data = http.post.calls.mostRecent().args[1].Request.body.encryptData;
      expect(data.fromDate).toBe('2025-12-31 01:00:00');
      expect(data.toDate).toBe('2025-12-31 23:59:59.999');
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('uses CASA and sends only accountNo when VAN is blank', () => {
    component.filterForm.controls.vanNo.setValue('   ');
    component.filterForm.controls.accountNo.setValue('00123');
    component.showResult();
    expect(http.post).toHaveBeenCalledWith('van/get-van-casa-transactions', {
      Request: { body: { encryptData: {
        customerID: '00456', accountNo: '00123', fromDate: '2026-09-01 00:00:00',
        toDate: '2026-09-22 23:59:59', noOfTransactions: '100', pageNo: '1',
      } } },
    }, { id: 7 });
  });

  it('requires a valid account selection for banks with multiple accounts', () => {
    component.accounts[0].accountNos = ['00123', '00456'];
    component.filterForm.patchValue({ vanNo: '', accountNo: 'other' });
    component.showResult();
    expect(http.post).not.toHaveBeenCalled();
    component.filterForm.controls.accountNo.setValue('00456');
    component.showResult();
    expect(http.post).toHaveBeenCalledTimes(1);
  });

  it('requires explicit account selection even for a bank with one account', () => {
    component.filterForm.controls.vanNo.setValue('');
    component.onBankSelect();
    component.showResult();
    expect(http.post).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('Select an account');
    component.filterForm.controls.accountNo.setValue('00123');
    component.showResult();
    expect(http.post).toHaveBeenCalledTimes(1);
  });

  it('clears the previous account and statement when the bank changes', () => {
    component.filterForm.controls.accountNo.setValue('00123');
    component.showResult();
    component.filterForm.controls.bankId.setValue('');
    component.onBankSelect();
    expect(component.filterForm.controls.accountNo.value).toBe('');
    expect(component.selectedBank).toBeUndefined();
    expect(component.result).toBeNull();
    component.goToPage(2);
    expect(http.post).toHaveBeenCalledTimes(1);
  });

  it('rejects out-of-range and fractional page sizes', () => {
    for (const values of [{ noOfTransactions: 501 }, { noOfTransactions: 1.5 }, { noOfTransactions: 0 }]) {
      component.filterForm.patchValue(values);
      component.showResult();
    }
    expect(http.post).not.toHaveBeenCalled();
  });

  it('reads both statement account fields and totals only returned transactions', () => {
    for (const accountField of ['acctNo', 'CasaAccountNumber']) {
      http.post.and.returnValue(of({ Response: { body: { encryptData: {
        [accountField]: '00123', CasaAccountName: 'Customer', pageNo: '1', TotalNoOfPages: '2',
        TransactionInquiryDetailsDTO: [
          { VanNo: 'VAN001', TransactionAmount: '0.10' },
          { VanNo: 'VAN002', TransactionAmount: '0.20' },
        ],
      } } } }));
      component.showResult();
      expect(component.rows.length).toBe(2);
      expect(component.statementAccount).toBe('00123');
      expect(component.totalAmount).toBe(0.3);
      expect(component.statementPages).toBe('2');
    }
  });

  it('does not show a misleading total for an invalid amount', () => {
    http.post.and.returnValue(of({ Response: { body: { encryptData: {
      TransactionInquiryDetailsDTO: [{ TransactionAmount: 'invalid' }],
    } } } }));
    component.showResult();
    expect(component.totalAmount).toBeNull();
  });

  it('rejects invalid dates and reversed periods', () => {
    component.filterForm.controls.fromDate.setValue('2026-02-30T00:00');
    component.showResult();
    component.filterForm.controls.fromDate.setValue('2026-10-01T00:00');
    component.showResult();
    expect(http.post).not.toHaveBeenCalled();
  });

  it('starts with filters and bounds result navigation by total pages', () => {
    expect(component.showFilters).toBeTrue();
    component.showResult();
    component.goToPage(0);
    component.goToPage(3);
    expect(http.post).toHaveBeenCalledTimes(1);
    component.goToPage(2);
    expect(component.currentPage).toBe(2);
    expect(http.post.calls.mostRecent().args[1].Request.body.encryptData.pageNo).toBe('2');
    component.goToPage(3);
    expect(http.post).toHaveBeenCalledTimes(2);
    component.goToPage(1);
    expect(component.currentPage).toBe(1);
    component.editFilters();
    expect(component.showFilters).toBeTrue();
  });

  it('opens an empty statement for successful responses with no results', () => {
    for (const response of [null, {}, { Response: { body: { encryptData: {
      TransactionInquiryDetailsDTO: null, TotalNoOfPages: '0',
    } } } }]) {
      component.editFilters();
      http.post.and.returnValue(of(response));
      component.showResult();
      expect(component.showFilters).toBeFalse();
      expect(component.rows).toEqual([]);
      expect(component.totalAmount).toBe(0);
      expect(component.totalPages).toBe(1);
      expect(component.errorMessage).toBe('');
    }
  });

  it('shows filters on API errors including a failed next page', () => {
    component.showResult();
    http.post.and.returnValue(throwError(() => new Error('Request failed')));
    component.goToPage(2);
    expect(component.showFilters).toBeTrue();
    expect(component.errorMessage).toBeTruthy();
    http.post.and.returnValue(of({ Error: 'Bank rejected enquiry' }));
    component.showResult();
    expect(component.showFilters).toBeTrue();
    expect(component.errorMessage).toBe('Bank rejected enquiry');
  });

  it('asks on each populated page and posts only the original current page data on confirmation', () => {
    const first = { pageNo: '1', TotalNoOfPages: '2', TransactionInquiryDetailsDTO: [{ VanNo: 'VAN001', extra: 'preserved' }] };
    const second = { ...first, pageNo: '2', TransactionInquiryDetailsDTO: [{ VanNo: 'VAN002' }] };
    http.post.and.returnValues(of({ Response: { body: { encryptData: first } } }),
      of({ response: { body: { encryptData: second } } }), of([]));
    component.showResult();
    expect(component.showUpdatePrompt).toBeTrue();
    expect(http.post).toHaveBeenCalledTimes(1);
    component.skipUpdate();
    expect(component.showUpdatePrompt).toBeFalse();
    component.updateStatement();
    expect(http.post).toHaveBeenCalledTimes(1);
    component.goToPage(2);
    expect(component.showUpdatePrompt).toBeTrue();
    component.updateStatement();
    expect(http.post).toHaveBeenCalledWith('van/update-statement', second);
    expect(component.updateMessage).toBe('Update results for page 2: 0 transactions.');
    expect(component.updateResults).toEqual([]);
    component.updateStatement();
    expect(http.post).toHaveBeenCalledTimes(3);
  });

  it('blocks duplicate updates and page changes during saving, and allows retry after failure', () => {
    http.post.and.returnValue(of({ Response: { body: { encryptData: {
      TotalNoOfPages: '2', TransactionInquiryDetailsDTO: [{ VanNo: 'VAN001' }],
    } } } }));
    component.showResult();
    const pending = new Subject<unknown>();
    http.post.and.returnValue(pending);
    component.updateStatement();
    component.updateStatement();
    component.goToPage(2);
    expect(http.post).toHaveBeenCalledTimes(2);
    pending.error(new Error('Failed'));
    expect(component.isLoading).toBeFalse();
    expect(component.showUpdatePrompt).toBeTrue();
    expect(component.showFilters).toBeFalse();
    expect(component.rows.length).toBe(1);
    http.post.and.returnValue(of({ Error: 'Update rejected' }));
    component.updateStatement();
    expect(component.errorMessage).toBe('Update rejected');
    expect(component.showUpdatePrompt).toBeTrue();
    http.post.and.returnValue(of([]));
    component.updateStatement();
    expect(component.showUpdatePrompt).toBeFalse();
    expect(component.errorMessage).toBe('');
  });

  it('does not offer updates for an empty page', () => {
    component.showResult();
    expect(component.showUpdatePrompt).toBeFalse();
    component.updateStatement();
    expect(http.post).toHaveBeenCalledTimes(1);
  });

  it('shows mixed transaction results in either JSON casing and clears them on page navigation', () => {
    http.post.and.returnValue(of({ Response: { body: { encryptData: {
      TotalNoOfPages: '2', TransactionInquiryDetailsDTO: [{ VanNo: 'VAN001' }],
    } } } }));
    component.showResult();
    http.post.and.returnValue(of([
      { Utr: 'U1', VanNo: 'VAN001', TxnRefNo: 'R1', Amount: 12.34, Status: 'Success', Message: 'Saved', Response: { id: 7 } },
      { utr: null, vanNo: 'VAN002', txnRefNo: 'R2', amount: 0, status: 'Failed', message: 'Not found', response: null },
    ]));
    component.updateStatement();
    expect(component.updateResults).toEqual([
      { utr: 'U1', vanNo: 'VAN001', txnRefNo: 'R1', amount: 12.34, status: 'Success', message: 'Saved', response: { id: 7 } },
      { utr: null, vanNo: 'VAN002', txnRefNo: 'R2', amount: 0, status: 'Failed', message: 'Not found', response: null },
    ]);
    expect(component.updateMessage).toBe('Update results for page 1: 2 transactions.');
    expect(component.showUpdatePrompt).toBeFalse();
    http.post.and.returnValue(of({}));
    component.goToPage(2);
    expect(component.updateResults).toBeNull();
    expect(component.updateMessage).toBe('');
  });

  it('does not report success when the update response is not a list', () => {
    http.post.and.returnValue(of({ Response: { body: { encryptData: {
      TransactionInquiryDetailsDTO: [{ VanNo: 'VAN001' }],
    } } } }));
    component.showResult();
    http.post.and.returnValue(of({}));
    component.updateStatement();
    expect(component.updateResults).toBeNull();
    expect(component.updateMessage).toBe('');
    expect(component.errorMessage).toContain('did not contain transaction results');
  });
});
