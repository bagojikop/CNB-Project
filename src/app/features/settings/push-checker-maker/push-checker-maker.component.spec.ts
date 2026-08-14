import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PushCheckerMakerComponent } from './push-checker-maker.component';

describe('PushCheckerMakerComponent', () => {
  let component: PushCheckerMakerComponent;
  let fixture: ComponentFixture<PushCheckerMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PushCheckerMakerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PushCheckerMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
