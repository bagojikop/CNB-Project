import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PushInitComponent } from './push-init.component';

describe('PushInitComponent', () => {
  let component: PushInitComponent;
  let fixture: ComponentFixture<PushInitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PushInitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PushInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
