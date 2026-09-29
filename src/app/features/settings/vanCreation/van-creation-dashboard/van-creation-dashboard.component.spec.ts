import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Http } from '@shared-services/httpService';

import { VanCreationDashboardComponent } from './van-creation-dashboard.component';

describe('VanCreationDashboardComponent', () => {
  let component: VanCreationDashboardComponent;
  let fixture: ComponentFixture<VanCreationDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VanCreationDashboardComponent],
      providers: [
        { provide: Http, useValue: { get: () => of({ status_cd: 1, data: [] }), readJson: () => of([]) } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(VanCreationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to local today and disables the start date when selecting a request', async () => {
    jasmine.clock().install();
    try {
      jasmine.clock().mockDate(new Date(2026, 8, 23, 0, 15));
      component.selectRequest({ id: '1', firmName: 'Firm', branchName: 'Branch',
        Request: { body: { encryptData: { accountNo: '123', startDate: '', endDate: '', countVAN: 0, virtualAccountDetails: [] } } } });
      expect(component.startDate).toBe('2026-09-23');
      expect(component.expiryDays).toBe(0);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('#startDate').disabled).toBeTrue();
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('adds months with month-end clamping before adding days', () => {
    component.startDate = '2024-01-31';
    component.expiryMonths = 1;
    component.expiryDays = 2;
    expect(component.endDate).toBe('2024-03-02');
    component.startDate = '2026-12-31';
    expect(component.endDate).toBe('2027-02-02');
    component.expiryMonths = 0;
    expect(component.endDate).toBe('2027-01-02');
  });

  it('rejects empty, negative, fractional and zero total durations', () => {
    for (const [months, days] of [[0, 0], [-1, 2], [1, -1], [1.5, 0], [1, 0.5], [null, 2], [1, null]]) {
      component.expiryMonths = months;
      component.expiryDays = days;
      expect(component.endDate).toBe('');
    }
  });
});
