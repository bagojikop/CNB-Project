import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentReceivedByVanComponent } from './payment-received-by-van.component';

describe('PaymentReceivedByVanComponent', () => {
  let component: PaymentReceivedByVanComponent;
  let fixture: ComponentFixture<PaymentReceivedByVanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentReceivedByVanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentReceivedByVanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
