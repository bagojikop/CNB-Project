import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Http } from '@shared-services/httpService';
import { MyProvider } from '@shared-services/provider';
import { VanRetrieveComponent } from './van-retrieve.component';

describe('VanRetrieveComponent', () => {
  let http: jasmine.SpyObj<Http>;
  let component: VanRetrieveComponent;
  const page = (number: number) => ({ Response: { body: { encryptData: {
    CasaAccountNo: '00123', fromDate: '2024-01-01', toDate: '2025-01-01',
    TotalNoOfPages: '3', TotalNoOfRecords: '3', pageNo: String(number),
    VanTxnDetailsDTO: [{ Van: ` VAN${number}`, VanStartDate: '29-04-2024', VanEndDate: '30-08-2030' }],
  } } } });
  beforeEach(() => {
    http = jasmine.createSpyObj<Http>('Http', ['get', 'post']);
    http.get.and.returnValue(of({ data: [{ id: 7, firmId: 2, firmName: 'Firm', customerId: '00111025456', accountNo: '00123,00456' }] }));
    TestBed.configureTestingModule({ providers: [
      { provide: Http, useValue: http }, { provide: MyProvider, useValue: { companyInfo: { company: { branch_id: '01' } } } },
    ] });
    component = TestBed.runInInjectionContext(() => new VanRetrieveComponent());
    component.onFirmSelect(component.firms[0]);
    component.filterForm.setValue({ firm_id: '2', accountNo: '00123', fromDate: '2024-01-01', endDate: '2025-01-01' });
  });
  it('fetches each API page in order and combines VAN details', () => {
    http.post.and.returnValues(of(page(1)), of(page(2)), of(page(3)));
    component.showResult();
    expect(http.post.calls.allArgs()).toEqual([1, 2, 3].map(pageNo => [
      'van/retrieve-van',
      { Request: { body: { encryptData: {
        customerID: '00111025456', accountNo: '00123', fromDate: '2024-01-01',
        toDate: '2025-01-01', noOfTransactions: '1000', pageNo: String(pageNo),
      } } } },
      { id: 7 },
    ]));
    expect(component.rows.map(row => row.Van)).toEqual(['VAN1', 'VAN2', 'VAN3']);
    expect(component.rows[0].VanStartDate).toBe('29-04-2024');
    expect(component.isLoading).toBeFalse();
  });
  it('accepts camelCase results without status_cd or an account number', () => {
    http.post.and.returnValue(of({ response: { body: { encryptData: {
      fromDate: '2026-09-01', toDate: '2027-09-30', totalNoOfPages: '1', totalNoOfRecords: '1',
      endOfStatement: 'Y', hasMoreResults: 'false', noOfRecords: '1', pageNo: '1',
      vanTxnDetailsDTO: [{ van: 'KGSRG0100015688', vanStartDate: '20-09-2026', vanEndDate: '20-09-2027' }],
    } } } }));
    component.showResult();
    expect(component.errorMessage).toBe('');
    expect(component.summary?.CasaAccountNo).toBe('00123');
    expect(component.rows).toEqual([{ Van: 'KGSRG0100015688', VanStartDate: '20-09-2026', VanEndDate: '20-09-2027' }]);
    expect(http.post).toHaveBeenCalledTimes(1);
  });
  it('uses camelCase page counts to fetch all pages', () => {
    http.post.and.returnValues(...[1, 2].map(pageNo => of({ response: { body: { encryptData: {
      totalNoOfPages: '2', totalNoOfRecords: '2', pageNo: String(pageNo),
      vanTxnDetailsDTO: [{ van: `VAN${pageNo}`, vanStartDate: '20-09-2026', vanEndDate: '20-09-2027' }],
    } } } })));
    component.showResult();
    expect(component.errorMessage).toBe('');
    expect(component.rows.map(row => row.Van)).toEqual(['VAN1', 'VAN2']);
    expect(component.fetchedPages).toBe(2);
  });
  it('shows the returned JSON when VAN details are missing', () => {
    const response = { response: { body: { encryptData: { message: 'No access' } } } };
    http.post.and.returnValue(of(response));
    component.showResult();
    expect(component.errorResponseJson).toBe(JSON.stringify(response, null, 2));
    expect(component.rows).toEqual([]);
    expect(component.isLoading).toBeFalse();
  });
  it('accepts an empty VAN details array without status or pagination metadata', () => {
    http.post.and.returnValue(of({ Response: { body: { encryptData: { VanTxnDetailsDTO: [] } } } }));
    component.showResult();
    expect(component.errorMessage).toBe('');
    expect(component.errorResponseJson).toBe('');
    expect(component.summary).not.toBeNull();
    expect(http.post).toHaveBeenCalledTimes(1);
  });
  it('updates all retrieved pages using the original firm context only once', () => {
    http.post.and.returnValues(of(page(1)), of(page(2)), of(page(3)), of({ status: 'Success', updatedCount: 3 }));
    component.showResult();
    component.onFirmSelect(null);
    component.updatePortal();
    const [url, payload, params] = http.post.calls.mostRecent().args;
    expect(url).toBe('van/update-vans');
    expect(params).toEqual({ firm_id: 2, branch_id: '01', customerId: '00111025456' });
    expect(payload.body.encryptData.VanTxnDetailsDTO.map((row: any) => row.Van)).toEqual(['VAN1', 'VAN2', 'VAN3']);
    expect(payload.Response).toBeUndefined();
    expect(component.portalMessage).toContain('3 VAN(s) updated');
    component.updatePortal();
    expect(http.post).toHaveBeenCalledTimes(4);
  });
  it('blocks portal updates after incomplete retrieval', () => {
    http.post.and.returnValues(of(page(1)), throwError(() => new Error('Unavailable')));
    component.showResult();
    component.updatePortal();
    expect(component.canUpdatePortal).toBeFalse();
    expect(http.post).toHaveBeenCalledTimes(2);
  });
  it('keeps portal updates retryable after a failed update', () => {
    http.post.and.returnValues(of(page(1)), of(page(2)), of(page(3)), throwError(() => new Error('Unavailable')));
    component.showResult();
    component.updatePortal();
    expect(component.portalUpdated).toBeFalse();
    expect(component.portalError).toBeTruthy();
    expect(component.canUpdatePortal).toBeTrue();
  });
  it('retains partial results and stops on a later page failure', () => {
    http.post.and.returnValues(of(page(1)), throwError(() => new Error('Unavailable')));
    component.showResult();
    expect(http.post).toHaveBeenCalledTimes(2);
    expect(component.rows.length).toBe(1);
    expect(component.errorMessage).toContain('page 2');
    expect(component.errorMessage).toContain('incomplete');
    expect(component.isLoading).toBeFalse();
  });
  it('rejects a reversed date range before fetching', () => {
    component.filterForm.controls.fromDate.setValue('2026-01-01');
    component.showResult();
    expect(http.post).not.toHaveBeenCalled();
  });
  it('does not send a request without a customer ID', () => {
    component.selectedFirm!.customerId = '';
    component.showResult();
    expect(http.post).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('customer ID');
  });
  it('clears the previous account when selecting a different firm', () => {
    component.onFirmSelect(null);
    expect(component.filterForm.controls.accountNo.value).toBe('');
  });
});
