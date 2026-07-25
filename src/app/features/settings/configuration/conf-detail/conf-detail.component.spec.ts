import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfDetailComponent } from './conf-detail.component';

describe('ConfDetailComponent', () => {
  let component: ConfDetailComponent;
  let fixture: ComponentFixture<ConfDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
