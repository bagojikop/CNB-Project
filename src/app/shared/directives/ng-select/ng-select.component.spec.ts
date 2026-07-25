import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgCustomSelectComponent } from './ng-select.component';

describe('NgCustomSelectComponent', () => {
  let component: NgCustomSelectComponent;
  let fixture: ComponentFixture<NgCustomSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgCustomSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgCustomSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
