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
import { DialogsService } from '@shared-services/messageBox';
import { vanCreationService } from '@shared-services/user.service';
import {
  DSS_FORM_CONTROLS,
  DssInputTextComponent,
} from '@shared-directives/dss-form-controls';

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
  private dialog = inject(DialogsService);
  private location = inject(Location);
  saveUndoButtonIsDisable: boolean = false;
  form: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      id: [''],
      mode: ['custom'],
      custom: this.fb.group({
        accountNo: ['', Validators.required],
        startDate: [
          new Date().toISOString().split('T')[0],
          Validators.required,
        ],
        endDate: [new Date().toISOString().split('T')[0], Validators.required],
        countVAN: [3, [Validators.required, Validators.min(1)]],
        virtualAccountDetails: this.fb.array([]),
      }),
      random: this.fb.group({
        accountNo: ['', Validators.required],
        startDate: [
          new Date().toISOString().split('T')[0],
          Validators.required,
        ],
        endDate: [new Date().toISOString().split('T')[0], Validators.required],
        countVAN: [
          1,
          [Validators.required, Validators.min(1), Validators.max(500)],
        ],
      }),
    });

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
    var data: any = this.location.getState();
    console.log('received ID:', data);

    if (data && data.id) {
      this.form.disable();

      this.form.get('custom.startDate')?.enable();
      this.form.get('custom.endDate')?.enable();

      this.form.get('random.startDate')?.enable();
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
      payload = {
        id: id || '',
        Request: {
          body: {
            encryptData: {
              accountNo: random.accountNo,
              startDate: random.startDate,
              endDate: random.endDate,
              countVAN: String(random.countVAN),
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
