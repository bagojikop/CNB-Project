import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOrderBomComponent } from './sales-order-bom.component';

describe('SalesOrderBomComponent', () => {
  let component: SalesOrderBomComponent;
  let fixture: ComponentFixture<SalesOrderBomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesOrderBomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesOrderBomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
