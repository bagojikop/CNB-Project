import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VanCreationDashboardComponent } from './van-creation-dashboard.component';

describe('VanCreationDashboardComponent', () => {
  let component: VanCreationDashboardComponent;
  let fixture: ComponentFixture<VanCreationDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VanCreationDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VanCreationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
