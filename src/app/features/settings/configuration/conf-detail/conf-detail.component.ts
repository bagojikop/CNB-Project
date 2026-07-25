import { AfterViewInit, Component, inject } from '@angular/core';
import {
  FormBuilder,
  ɵInternalFormsSharedModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  CaseStyle,
  DSS_FORM_CONTROLS,
} from '@shared-directives/dss-form-controls';
import {
  createConfigurationForm,
  createModalForm,
} from './conf-detail.factory';
import { Router } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import * as CryptoJS from 'crypto-js';
import { configuration } from '@shared-interfaces/settings/configuration';
import { crudService } from '@shared-services/crudService';

@Component({
  selector: 'app-conf-detail',
  imports: [DSS_FORM_CONTROLS, ɵInternalFormsSharedModule, ReactiveFormsModule],
  templateUrl: './conf-detail.component.html',
  styleUrl: './conf-detail.component.scss',
  providers: [DatePipe],
})
export class ConfDetailComponent implements AfterViewInit {
  readonly caseStyle = CaseStyle;
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private location = inject(Location);
  private configService = inject(crudService);
  readonly configInputs = createConfigurationForm(this.fb);
  readonly modalForm = createModalForm(this.fb);
  private datePipe = inject(DatePipe);
  visible: boolean = false;
  isTxnPsw: boolean = true;
  isConfSubmitting: boolean = false;

  toggleLiveDemo = () => (this.visible = false);
  showOtp: boolean = false;
  Credentials = <configuration[]>[];

  ngAfterViewInit(): void {
    var editData = this.location.getState() as any;

    if (editData.action == 'view') {
      this.configInputs.patchValue(editData.data);
    }
  }

  save() {
    if (this.configInputs.valid) {
      this.isTxnPsw = false;
      this.isConfSubmitting = true;
    }
  }

  isTXNPassword(): boolean {
    return !this.modalForm.controls.txn_password.value;
  }

  sendEncryptedPsw() {
    const key = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012'); // 32 bytes
    const iv = CryptoJS.enc.Utf8.parse('1234567890123456'); // 16 bytes

    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(this.modalForm.controls.txn_password.value),
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    this.modalForm.patchValue({
      encrypted_psw: encrypted.toString(),
      mobile_no: '917083234537',
    });

    this.showOtp = true;
  }

  saveModalData() {
    const josnData = this.configService.getAll() as configuration[];

    const nextBatchId = josnData.length
      ? Math.max(...josnData.map((x) => x.batchId)) + 1
      : 1;

    const data: configuration = {
      ...this.configInputs.getRawValue(),
      batchId: nextBatchId,
      credDate: this.datePipe.transform(new Date(), 'yyyy-MM-dd') ?? '',
      modalForm: this.modalForm.getRawValue(),
    };

    this.configService.add(data);

    this.configInputs.reset();
    this.modalForm.reset();
    this.visible = false;
    this.isTxnPsw = true;
    this.isConfSubmitting = false;
  }

  closePage() {
    this.location.back();
  }
}
