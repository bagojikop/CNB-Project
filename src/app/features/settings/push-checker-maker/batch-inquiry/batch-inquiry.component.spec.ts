import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchInquiryComponent } from './batch-inquiry.component';

describe('BatchInquiryComponent', () => {
  let component: BatchInquiryComponent;
  let fixture: ComponentFixture<BatchInquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchInquiryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchInquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
