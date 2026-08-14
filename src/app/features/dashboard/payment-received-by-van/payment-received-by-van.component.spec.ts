import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentReceivedByVANComponent } from './payment-received-by-van.component';

describe('PaymentReceivedByVANComponent', () => {
  let component: PaymentReceivedByVANComponent;
  let fixture: ComponentFixture<PaymentReceivedByVANComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentReceivedByVANComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentReceivedByVANComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
