import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentRequestApprovalComponent } from './payment-request-approval.component';

describe('PaymentRequestApprovalComponent', () => {
  let component: PaymentRequestApprovalComponent;
  let fixture: ComponentFixture<PaymentRequestApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentRequestApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentRequestApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
