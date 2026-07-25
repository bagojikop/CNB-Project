import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DefaultBreadcrumbComponent } from './default-breadcrumb.component';

describe('DefaultBreadcrumbComponent', () => {
  let component: DefaultBreadcrumbComponent;
  let fixture: ComponentFixture<DefaultBreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultBreadcrumbComponent],
      providers: [provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DefaultBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
