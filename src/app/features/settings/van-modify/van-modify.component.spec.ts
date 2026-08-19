import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VanModifyComponent } from './van-modify.component';

describe('VanModifyComponent', () => {
  let component: VanModifyComponent;
  let fixture: ComponentFixture<VanModifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VanModifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VanModifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
