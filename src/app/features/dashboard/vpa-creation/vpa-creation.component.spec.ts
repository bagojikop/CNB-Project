import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { Http } from '@shared-services/httpService';
import { VpaCreationComponent, toVpaAccount } from './vpa-creation.component';

describe('VpaCreationComponent', () => {
  let component: VpaCreationComponent;
  let http: jasmine.SpyObj<Http>;
  const account = {
    id: 42, bankName: 'Test Bank', accountNo: '001234', mcc: '1234', sid: 'SID01', merchId: 'MID01',
    accountName: 'Merchant', ifsc_Code: 'TEST0123456', mobileNo: '9000000000', channel: 'UPI',
    terminalId: 'T01', checksum: 'provided-checksum', additionalNo: 'A01',
  };

  beforeEach(() => {
    http = jasmine.createSpyObj<Http>('Http', ['get', 'post']);
    http.get.and.returnValue(of({ status_cd: 1, data: [account] }));
    TestBed.configureTestingModule({ providers: [{ provide: Http, useValue: http }] });
    component = TestBed.runInInjectionContext(() => new VpaCreationComponent());
  });

  it('loads configured accounts and preserves account number leading zeros', () => {
    component.ngOnInit();
    expect(http.get).toHaveBeenCalledWith('bankAccount/all');
    expect(component.rows[0].data.account_number).toBe('001234');
    expect(component.canCreate(component.rows[0])).toBeTrue();
  });

  it('blocks incomplete accounts including whitespace-only fields', () => {
    for (const key of ['bankName', 'accountNo', 'mcc', 'sid', 'merchId']) {
      const row = toVpaAccount({ ...account, ...(key === 'bankName' ? { accountName: '' } : {}), [key]: '   ' });
      expect(component.canCreate(row)).toBeFalse();
      component.create(row);
    }
    expect(http.post).not.toHaveBeenCalled();
  });

  it('restores saved VPA state by bank account ID and individual account number', () => {
    http.get.and.callFake((url: string) => of<any>(url === 'bankAccount/all'
      ? { status_cd: 1, data: [{ ...account, accountNo: '001234,005678' }] }
      : { status_cd: 1, data: [
          { bankAccountId: 42, accountNumber: '001234', upiId: 'saved@bank', status: 'Active' },
          { bankAccountId: 42, accountNumber: '005678', status: 'Pending', batchId: 'batch1' },
        ] }));
    component.loadAccounts();
    expect(component.rows[0].upiId).toBe('saved@bank');
    expect(component.canDeactivate(component.rows[0])).toBeTrue();
    expect(component.canCreate(component.rows[0])).toBeFalse();
    expect(component.rows[1].status).toBe('Pending');
    expect(component.canCreate(component.rows[1])).toBeFalse();
    expect(component.canDeactivate(component.rows[1])).toBeFalse();
  });

  it('blocks the list if saved registrations cannot be loaded', () => {
    http.get.and.callFake((url: string) => of<any>(url === 'bankAccount/all'
      ? { status_cd: 1, data: [account] } : { status_cd: 0 }));
    component.loadAccounts();
    expect(component.loadError).toContain('saved VPAs');
    expect(component.rows).toEqual([]);
  });

  it('splits comma-separated accounts and submits only the selected number with its original ID', () => {
    http.get.and.returnValue(of({ status_cd: 1, data: [{ ...account, accountNo: '001234, 005678, , ' }] }));
    http.post.and.returnValue(of({ status_cd: 1 }));
    component.loadAccounts();
    expect(component.rows.map(row => row.data.account_number)).toEqual(['001234', '005678']);
    expect(component.rows.map(row => row.id)).toEqual([42, 42]);
    component.create(component.rows[1]);
    const [, body, params] = http.post.calls.mostRecent().args;
    expect(body.Request.body.encryptData.account_number).toBe('005678');
    expect(params).toEqual({ id: 42 });
    expect(component.rows[0].created).toBeFalse();
  });

  it('keeps an empty account visible with Create disabled', () => {
    http.get.and.returnValue(of({ status_cd: 1, data: [{ ...account, accountNo: ', , ' }] }));
    component.loadAccounts();
    expect(component.rows.length).toBe(1);
    expect(component.rows[0].data.account_number).toBe('');
    expect(component.canCreate(component.rows[0])).toBeFalse();
  });

  it('makes one creation request and blocks duplicate clicks', () => {
    const response = new Subject<any>();
    http.post.and.returnValue(response);
    const row = toVpaAccount(account);
    component.create(row);
    component.create(row);
    expect(http.post).toHaveBeenCalledOnceWith('vpa/upi-vpa-creation',
      { Request: { body: { encryptData: row.data } } }, { id: 42 });
    response.next({ Response: { body: { encryptData: { status: 'SUCCESS', respCode: '00', response: { upiId: 'new@bank' } } } } });
    response.complete();
    expect(http.post.calls.count()).toBe(1);
    expect(row.created).toBeTrue();
    expect(row.pending).toBeFalse();
    expect(component.canDeactivate(row)).toBeTrue();
    expect(component.canCreate(row)).toBeFalse();
  });

  it('prevents repeating bank creation when server-side saving fails', () => {
    http.post.and.returnValue(throwError(() => ({ error: {
      bankCreated: true, errors: { message: 'Bank creation succeeded, but saving failed.' },
    } })));
    const row = toVpaAccount(account);
    component.create(row);
    component.create(row);
    expect(http.post.calls.count()).toBe(1);
    expect(row.created).toBeTrue();
    expect(row.pending).toBeFalse();
    expect(row.error).toBeTrue();
    expect(row.message).toContain('saving failed');
    expect(component.canCreate(row)).toBeFalse();
  });

  it('shows business errors and allows retry after rejection', () => {
    http.post.and.returnValue(of({ status_cd: 0, errors: { message: 'Invalid merchant' } }));
    const row = toVpaAccount(account);
    component.create(row);
    expect(http.post.calls.count()).toBe(1);
    expect(row.message).toBe('Invalid merchant');
    expect(row.error).toBeTrue();
    expect(component.canCreate(row)).toBeTrue();
  });

  it('clears pending state after transport failure without claiming success', () => {
    http.post.and.returnValue(throwError(() => new Error('Network failure')));
    const row = toVpaAccount(account);
    component.create(row);
    expect(row.pending).toBeFalse();
    expect(row.created).toBeFalse();
    expect(row.error).toBeTrue();
  });

  it('reports account loading failure', () => {
    http.get.and.returnValue(throwError(() => new Error('Network failure')));
    component.loadAccounts();
    expect(component.loading).toBeFalse();
    expect(component.loadError).toContain('Unable to load');
  });

  it('blocks both requests when the bank account ID is missing or invalid', () => {
    for (const id of [undefined, null, '', 'invalid', 0, -1, 1.5]) {
      const row = toVpaAccount({ ...account, id });
      component.create(row);
      row.upiId = 'merchant@bank';
      component.deactivate(row);
      expect(row.id).toBeNull();
    }
    expect(http.post).not.toHaveBeenCalled();
    expect(toVpaAccount({ ...account, id: '42' }).id).toBe(42);
  });

  it('enables deactivation only for existing VPA IDs and blocks their creation', () => {
    for (const key of ['upiId', 'upi_id', 'vpa', 'vpaId']) {
      const row = toVpaAccount({ ...account, [key]: ' merchant@bank ' });
      expect(component.canDeactivate(row)).toBeTrue();
      expect(component.canCreate(row)).toBeFalse();
      expect(row.upiId).toBe('merchant@bank');
    }
    const row = toVpaAccount({ ...account, upiId: ' ' });
    component.deactivate(row);
    expect(component.canDeactivate(row)).toBeFalse();
    expect(http.post).not.toHaveBeenCalled();
  });

  it('posts only deactivation fields and blocks duplicate and completed requests', () => {
    const response = new Subject<any>();
    http.post.and.returnValue(response);
    const row = toVpaAccount({ ...account, upiId: 'merchant@bank' });
    component.deactivate(row);
    component.deactivate(row);
    expect(http.post).toHaveBeenCalledOnceWith('portal/vpa/upi-vpa-deactivation', {
      Request: { body: { encryptData: {
        channel: 'UPI', upiId: 'merchant@bank', mid: 'MID01', terminalId: 'T01', sid: 'SID01', checksum: 'provided-checksum',
      } } },
    }, { id: 42 });
    response.next({ status_cd: 1 });
    response.complete();
    expect(row.deactivated).toBeTrue();
    expect(row.pending).toBeFalse();
    expect(row.deactivating).toBeFalse();
    expect(component.canDeactivate(row)).toBeFalse();
  });

  it('retains existing VPA when deactivation is rejected or fails', () => {
    const row = toVpaAccount({ ...account, upiId: 'merchant@bank' });
    http.post.and.returnValue(of({ status_cd: 0, errors: { message: 'Request rejected' } }));
    component.deactivate(row);
    expect(row.message).toBe('Request rejected');
    expect(row.deactivated).toBeFalse();
    expect(component.canDeactivate(row)).toBeTrue();
    http.post.and.returnValue(throwError(() => new Error('Network failure')));
    component.deactivate(row);
    expect(row.error).toBeTrue();
    expect(row.pending).toBeFalse();
    expect(row.deactivating).toBeFalse();
    expect(row.upiId).toBe('merchant@bank');
    expect(row.deactivated).toBeFalse();
  });

  it('enables deactivation when creation returns a UPI ID', () => {
    http.post.and.returnValue(of({ Response: { body: { encryptData: { status: 'SUCCESS', response: { upiId: 'new@bank' } } } } }));
    const row = toVpaAccount(account);
    component.create(row);
    expect(row.upiId).toBe('new@bank');
    expect(component.canDeactivate(row)).toBeTrue();
    expect(component.canCreate(row)).toBeFalse();
  });
});
