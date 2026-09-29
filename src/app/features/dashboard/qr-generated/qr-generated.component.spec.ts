import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { Http } from '@shared-services/httpService';
import { QrGeneratedComponent } from './qr-generated.component';

describe('QrGeneratedComponent', () => {
  let component: QrGeneratedComponent;
  let http: jasmine.SpyObj<Http>;
  beforeEach(() => {
    http = jasmine.createSpyObj<Http>('Http', ['get']);
    TestBed.configureTestingModule({ providers: [{ provide: Http, useValue: http }] });
    component = TestBed.runInInjectionContext(() => new QrGeneratedComponent());
    component.banks = [{ id: 42, label: 'Bank A' }, { id: 43, label: 'Bank B' }];
  });

  it('uses accountName as the bank label and waits for selection', () => {
    http.get.and.returnValue(of([{ id: 42, accountName: 'Bank A' }]));
    component.loadBanks();
    expect(component.banks).toEqual([{ id: 42, label: 'Bank A' }]);
    expect(http.get.calls.count()).toBe(1);
    expect(component.rows).toEqual([]);
  });

  it('requests records for the selected bank and page only', () => {
    http.get.and.returnValue(of({ status_cd: 1, data: [], total: 51 }));
    component.selectBank('42');
    expect(http.get).toHaveBeenCalledWith('portal/upi-qr/generated', { id: 42, page: 1, pageSize: 25 });
    expect(component.pageCount).toBe(3);
    component.loadPage(2);
    expect(http.get).toHaveBeenCalledWith('portal/upi-qr/generated', { id: 42, page: 2, pageSize: 25 });
  });

  it('ignores an earlier bank response after changing selection', () => {
    const first = new Subject<any>();
    const second = new Subject<any>();
    http.get.and.returnValues(first, second);
    component.selectBank('42');
    component.selectBank('43');
    second.next({ status_cd: 1, data: [{ batch_id: 2, bank_id: 43 }], total: 1 });
    second.complete();
    first.next({ status_cd: 1, data: [{ batch_id: 1, bank_id: 42 }], total: 1 });
    first.complete();
    expect(component.rows[0].bank_id).toBe(43);
    expect(component.loading).toBeFalse();
  });

  it('clears rows when the bank selection is cleared', () => {
    http.get.and.returnValue(of({ status_cd: 1, data: [{ batch_id: 1 }], total: 1 }));
    component.selectBank('42');
    component.selectBank('');
    expect(component.rows).toEqual([]);
    expect(component.bankId).toBeNull();
    expect(http.get.calls.count()).toBe(1);
  });

  it('reports API and network failures without showing stale data', () => {
    http.get.and.returnValue(of({ status_cd: 0, errors: { message: 'Unavailable' } }));
    component.selectBank('42');
    expect(component.error).toBe('Unavailable');
    http.get.and.returnValue(throwError(() => new Error('Offline')));
    component.loadPage();
    expect(component.loading).toBeFalse();
    expect(component.error).toContain('Unable to load');
    expect(component.rows).toEqual([]);
  });

  it('shows the requested document and challan values', () => {
    expect(component.part('INV|DOC001', 0)).toBe('INV');
    expect(component.part('INV|DOC001', 1)).toBe('DOC001');
    expect(component.part('INV|000123', 1)).toBe('000123');
  });
});
