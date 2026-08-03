import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DialogsService } from '@shared-services/messageBox';
import { vanCreationService } from '@shared-services/user.service';

import { VanCreationEditComponent } from './van-creation-edit.component';

describe('VanCreationEditComponent', () => {
  let component: VanCreationEditComponent;
  let fixture: ComponentFixture<VanCreationEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VanCreationEditComponent],
      providers: [
        { provide: Location, useValue: { getState: () => ({}) } },
        {
          provide: DialogsService,
          useValue: { swal: jasmine.createSpy('swal') },
        },
        {
          provide: vanCreationService,
          useValue: {
            add: () => of({}),
            getById: () => of({ Request: { body: { encryptData: {} } } }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VanCreationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the VAN form array with the loaded values', () => {
    component.populateVirtualAccountDetails([{ vanNumber: 'VAN-100' }]);

    expect(component.virtualAccountDetails.length).toBe(1);
    expect(component.virtualAccountDetails.at(0).get('vanNumber')?.value).toBe(
      'VAN-100',
    );
  });
});
