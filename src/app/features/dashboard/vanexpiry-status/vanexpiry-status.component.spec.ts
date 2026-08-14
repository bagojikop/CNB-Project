import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VANExpiryStatusComponent } from './vanexpiry-status.component';

describe('VANExpiryStatusComponent', () => {
  let component: VANExpiryStatusComponent;
  let fixture: ComponentFixture<VANExpiryStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VANExpiryStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VANExpiryStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
