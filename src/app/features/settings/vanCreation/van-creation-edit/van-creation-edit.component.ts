import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { CreateVANRequest } from '@shared-interfaces/settings/van-creation';
import { bankAccount } from '@shared-interfaces/settings/bankAccount';
import { DialogsService } from '@shared-services/messageBox';
import {
  ConfigService,
  vanCreationService,
} from '@shared-services/user.service';
import {
  DSS_FORM_CONTROLS,
  DssInputTextComponent,
} from '@shared-directives/dss-form-controls';
import { createVanCreation } from './van-creation-edit.factory';

@Component({
  selector: 'app-van-creation-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DSS_FORM_CONTROLS,
    DssInputTextComponent,
  ],
  templateUrl: './van-creation-edit.component.html',
  styleUrls: ['./van-creation-edit.component.scss'],
})
export class VanCreationEditComponent implements OnInit {
  private crudSrc = inject(vanCreationService);
  private configSrc = inject(ConfigService);
  private dialog = inject(DialogsService);
  private location = inject(Location);
  private readonly fb = inject(FormBuilder);
  saveUndoButtonIsDisable: boolean = false;
  form = createVanCreation(this.fb);
  submitted = false;
  bankAccounts: bankAccount[] = [];

  constructor() {
    // enable/disable validators based on initial mode
    const modeControl = this.form.get('mode');
    if (modeControl) {
      // start with custom enabled, random disabled
      this.enableCustom();

      modeControl.valueChanges.subscribe((m) => {
        if (m === 'custom') {
          this.enableCustom();
        } else {
          this.enableRandom();
        }
      });
    }
  }

  ngOnInit(): void {
    this.loadBankAccounts();
    var data: any = this.location.getState();
    console.log('received ID:', data);

    // Listen to countVAN changes to auto-generate VAN numbers
    this.customGroup.get('countVAN')?.valueChanges.subscribe((count) => {
      if (count && count > 0) {
        this.generateVANNumbers();
      }
    });

    if (data && data.id) {
      this.form.disable();

      this.form.get('custom.endDate')?.enable();

      this.form.get('random.endDate')?.enable();

      this.saveUndoButtonIsDisable = true;

      this.crudSrc.getById(data.id).subscribe({
        next: (response) => {
          console.log('response:', response);
          const encryptData = response.Request.body.encryptData;

          // Temporarily enable custom group to allow form array updates
          this.customGroup.enable({ emitEvent: false });

          // Populate the form array FIRST before patching values
          this.populateVirtualAccountDetails(
            encryptData.virtualAccountDetails ?? [],
          );

          this.form.patchValue({
            id: data.id,
            mode: encryptData.virtualAccountDetails ? 'custom' : 'random',
            custom: {
              accountNo: encryptData.accountNo,
              startDate: encryptData.startDate,
              endDate: encryptData.endDate,
              countVAN: Number(encryptData.countVAN),
            },
            random: {
              accountNo: encryptData.accountNo,
              startDate: encryptData.startDate,
              endDate: encryptData.endDate,
              countVAN: Number(encryptData.countVAN),
            },
          });
        },
        error: (error) => {
          this.dialog.swal({
            dialog: 'error',
            message: error.message,
          });
        },
      });
    }
  }

  private loadBankAccounts(): void {
    this.configSrc.getAll().subscribe({
      next: (accounts) => {
        this.bankAccounts = accounts;
      },
      error: (error) => {
        this.dialog.swal({
          dialog: 'error',
          message: error.message,
        });
      },
    });
  }

  // Generate unique VAN numbers based on count
  generateVANNumbers(): void {
    const count = this.customGroup.get('countVAN')?.value;
    if (!count || count < 1) {
      return;
    }

    // Clear existing VAN details
    this.virtualAccountDetails.clear();

    // Generate unique VAN numbers
    const timestamp = Date.now().toString().slice(-6);
    for (let i = 0; i < count; i++) {
      const vanNumber = `VAN${timestamp}${String(i + 1).padStart(3, '0')}`;
      this.virtualAccountDetails.push(
        this.fb.group({
          vanNumber: [vanNumber, Validators.required],
        }),
      );
    }
  }

  get mode() {
    return this.form.get('mode')?.value;
  }

  get customGroup(): FormGroup {
    return this.form.get('custom') as FormGroup;
  }

  get randomGroup(): FormGroup {
    return this.form.get('random') as FormGroup;
  }

  get virtualAccountDetails(): FormArray {
    return this.customGroup.get('virtualAccountDetails') as FormArray;
  }

  addVanNumber(): void {
    // Check if first item exists and has a value
    const firstItem = this.virtualAccountDetails.at(0);
    if (firstItem) {
      const vanNumberControl = firstItem.get('vanNumber');
      if (!vanNumberControl?.value || vanNumberControl.invalid) {
        // First item is empty or invalid, mark it as touched
        vanNumberControl?.markAsTouched();
        return;
      }
    }

    this.virtualAccountDetails.push(
      this.fb.group({ vanNumber: ['', Validators.required] }),
    );
  }

  populateVirtualAccountDetails(
    items: Array<{ vanNumber?: string }> = [],
  ): void {
    this.virtualAccountDetails.clear();

    if (items.length === 0) {
      this.addVanNumber();
      return;
    }

    items.forEach((item) => {
      this.virtualAccountDetails.push(
        this.fb.group({
          vanNumber: [item.vanNumber ?? '', Validators.required],
        }),
      );
    });
  }

  private enableCustom(): void {
    this.customGroup.enable({ emitEvent: false });
    this.randomGroup.disable({ emitEvent: false });
  }

  private enableRandom(): void {
    this.randomGroup.enable({ emitEvent: false });
    this.customGroup.disable({ emitEvent: false });
  }

  removeVanNumber(index: number): void {
    if (this.virtualAccountDetails.length > 1) {
      this.virtualAccountDetails.removeAt(index);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Generate random VAN numbers for random mode
  generateRandomVANs(count: number): any[] {
    const vans = [];
    const timestamp = Date.now().toString().slice(-6);
    for (let i = 0; i < count; i++) {
      const vanNumber = `VAN${timestamp}${String(i + 1).padStart(3, '0')}`;
      vans.push({ vanNumber });
    }
    return vans;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const mode = this.form.get('mode')?.value;
    const id = this.form.get('id')?.value;
    let payload: any;

    if (mode === 'custom') {
      const custom = this.customGroup.value;
      payload = {
        id: id || '',
        Request: {
          body: {
            encryptData: {
              accountNo: custom.accountNo,
              startDate: custom.startDate,
              endDate: custom.endDate,
              countVAN: String(custom.virtualAccountDetails?.length || 0),
              virtualAccountDetails: custom.virtualAccountDetails,
            },
          },
        },
      };
    } else {
      const random = this.randomGroup.value;
      const count = Number(random.countVAN) || 0;

      // Generate VAN numbers for random mode
      const randomVans = this.generateRandomVANs(count);

      payload = {
        id: id || '',
        Request: {
          body: {
            encryptData: {
              accountNo: random.accountNo,
              startDate: random.startDate,
              endDate: random.endDate,
              countVAN: String(count),
              virtualAccountDetails: randomVans,
            },
          },
        },
      };
    }

    if (id) {
      this.crudSrc.update(payload).subscribe({
        next: (response) => {
          this.dialog.swal({
            dialog: 'success',
            message: 'VAN Updated Successfully',
          });
        },
        error: (error) => {
          this.dialog.swal({
            dialog: 'error',
            message: error.message,
          });
        },
      });
    } else {
      this.crudSrc.add(payload).subscribe({
        next: (response) => {
          this.dialog.swal({
            dialog: 'success',
            message: 'VAN Created Successfully',
          });
        },
        error: (error) => {
          this.dialog.swal({
            dialog: 'error',
            message: error.message,
          });
        },
      });
    }
  }
}
