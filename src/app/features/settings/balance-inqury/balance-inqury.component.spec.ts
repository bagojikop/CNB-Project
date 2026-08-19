import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceInquryComponent } from './balance-inqury.component';

describe('BalanceInquryComponent', () => {
  let component: BalanceInquryComponent;
  let fixture: ComponentFixture<BalanceInquryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceInquryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalanceInquryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
