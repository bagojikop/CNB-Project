import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMgtDashboardComponent } from './user-mgt-dashboard.component';

describe('UserMgtDashboardComponent', () => {
  let component: UserMgtDashboardComponent;
  let fixture: ComponentFixture<UserMgtDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMgtDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMgtDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
