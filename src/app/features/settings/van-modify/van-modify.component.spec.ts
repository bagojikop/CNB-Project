import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { Http } from '@shared-services/httpService';
import { VanModifyComponent } from './van-modify.component';

describe('VanModifyComponent', () => {
  let component: VanModifyComponent;
  let http: jasmine.SpyObj<Http>;
  beforeEach(() => {
    http = jasmine.createSpyObj<Http>('Http', ['get', 'post']);
    http.get.and.returnValue(of({ status_cd: 1, data: [
      { vch_id: 1, firm_id: 2, branch_id: '03', srcAcctNumber: '00123', customerId: '0045', VanNumber: '0001', CustomerName: 'A', StartDate: '2025-01-01', EndDate: '2090-01-01' },
      { vch_id: 1, firm_id: 2, branch_id: '03', srcAcctNumber: '00123', customerId: '0045', VanNumber: '0002', CustomerName: 'B', EndDate: '2090-02-01' },
    ] }));
    http.post.and.returnValue(of([{ Id: 1, firm_id: 2, branch_id: '03', srcAcctNumber: '00123', customerId: '0045',
      VANResponse: [{ van: '0001', response: { response: { body: { encryptData: { vanModifyResponse: { status: { replyCode: '0', errorCode: '1749' } } } } } } }] }]));
    TestBed.configureTestingModule({ providers: [{ provide: Http, useValue: http }] });
    component = TestBed.runInInjectionContext(() => new VanModifyComponent());
    component.ngOnInit();
  });
  it('loads the modify requests and selects all individual VANs', () => {
    expect(http.get).toHaveBeenCalledWith('VanCreateRequest/modify-requests');
    component.toggleAll(true);
    expect(component.selectedVans.length).toBe(2);
    expect(component.allSelected).toBeTrue();
    component.toggleAll(false);
    expect(component.selectedVans.length).toBe(0);
  });
  it('posts only the selected VAN with the exact DTO fields', () => {
    component.vanList[0].checked = true;
    component.extensionMonths = 12;
    component.submit();
    expect(http.post).toHaveBeenCalledWith('van/modify-van', [{
      Id: 1, endDate: '2091-01-01', firm_id: 2, branch_id: '03',
      srcAcctNumber: '00123', customerId: '0045', van: '0001',
    }]);
    expect(component.vanList.map(row => row.van)).toEqual(['0002']);
  });
  it('shows mixed results and retains only failed VANs for retry', () => {
    http.post.and.returnValue(of([{ id: 1, firm_id: 2, branch_id: '03', srcAcctNumber: '00123', customerId: '0045',
      vanResponse: [{ van: '0001', response: { response: { body: { encryptData: { vanModifyResponse: { status: { replyCode: '0', errorCode: '1749' } } } } } } }, { van: '0002', error: 'Bank rejected extension', response: {} }] }]));
    component.toggleAll(true);
    component.extensionMonths = 1;
    component.submit();
    expect(component.results.map(row => row.success)).toEqual([true, false]);
    expect(component.results[1].error).toBe('Bank rejected extension');
    expect(component.selectedVans.map(row => row.van)).toEqual(['0002']);
  });
  it('does not treat an empty response as success', () => {
    http.post.and.returnValue(of([{ Id: 1, firm_id: 2, branch_id: '03', srcAcctNumber: '00123', customerId: '0045',
      VANResponse: [{ van: '0001', error: '', response: {} }] }]));
    component.toggleAll(true);
    component.extensionMonths = 1;
    component.submit();
    expect(component.results.map(row => row.success)).toEqual([false, false]);
    expect(component.selectedVans.length).toBe(2);
  });
  it('rejects invalid extensions and missing customer IDs', () => {
    component.toggleAll(true);
    component.extensionDays = -1;
    component.submit();
    expect(http.post).not.toHaveBeenCalled();
    component.extensionMonths = 12;
    component.extensionDays = 0;
    component.vanList[0].customerId = '';
    component.submit();
    expect(http.post).not.toHaveBeenCalled();
  });
  it('clamps month ends before adding days and recalculates for selection', () => {
    component.vanList[0].endDate = '2092-01-31';
    component.vanList[0].checked = true;
    component.extensionMonths = 1;
    expect(component.endDate).toBe('2092-02-29');
    component.extensionDays = 1;
    expect(component.endDate).toBe('2092-03-01');
    component.toggleAll(false);
    expect(component.endDate).toBe('');
  });
  it('prevents duplicate submissions and preserves selection on API failure', () => {
    const response = new Subject<unknown>();
    http.post.and.returnValue(response);
    component.toggleAll(true);
    component.extensionMonths = 12;
    component.submit();
    component.submit();
    expect(http.post).toHaveBeenCalledTimes(1);
    response.next({ status_cd: 0 });
    response.complete();
    expect(component.selectedVans.length).toBe(2);
    expect(component.error).toBeTruthy();
    expect(component.submitting).toBeFalse();
    expect(component.success).toBe('');
  });
});
