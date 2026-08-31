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
  createAccessTokenForm,
  createConfigurationForm,
  createPasswordModalForm,
} from './bankAccount-detail.factory';
import { Router } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { bankAccount } from '@shared-interfaces/settings/bankAccount';

import { ConfigService } from '@shared-services/user.service';
import { DialogsService } from '@shared-services/messageBox';
import { DataRefreshService } from '@shared-services/data-refresh.service';
import { Http } from '@shared-services/httpService';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface Firm {
  firm_code: number;
  firm_name: string;
}

interface Branch {
  branch_code: string;
  branch_name: string;
}

@Component({
  selector: 'app-bank-accout-detail',
  imports: [DSS_FORM_CONTROLS, ɵInternalFormsSharedModule, ReactiveFormsModule],
  templateUrl: './bankAccount-detail.component.html',
  styleUrl: './bankAccount-detail.component.scss',
  providers: [DatePipe],
})
export class BankAccountDetailComponent implements AfterViewInit {
  readonly caseStyle = CaseStyle;
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private location = inject(Location);
  private dialogSrc = inject(DialogsService);
  private http = inject(Http);
  private httpClient = inject(HttpClient);
  private readonly refreshService = inject(DataRefreshService);
  readonly configInputs = createConfigurationForm(this.fb);
  readonly passwordModalForm = createPasswordModalForm(this.fb);
  readonly accessTokenForm = createAccessTokenForm(this.fb);
  private datePipe = inject(DatePipe);
  accessTokenModalVisible: boolean = false;
  generatedAuthorizationUrl: string = '';
  awaitingAuthorizationCode: boolean = false;
  isConfSubmitting: boolean = false;
  passwordModalVisible: boolean = false;
  passwordTarget: 'login' | 'txn' | null = null;
  firms: Firm[] = [];
  branches: Branch[] = [];

  onFirmChange(firm: Firm | null): void {
    this.configInputs.patchValue({
      firmName: firm?.firm_name ?? '',
    });
  }

  openPasswordModal(target: 'login' | 'txn') {
    this.passwordTarget = target;
    this.showOtp = false;
    this.passwordModalForm.reset();
    this.passwordModalVisible = true;
  }

  closePasswordModal() {
    this.passwordModalVisible = false;
    this.passwordTarget = null;
    this.showOtp = false;
    this.passwordModalForm.reset();
  }
  openAccessTokenModal() {
    this.awaitingAuthorizationCode = false;
    this.generatedAuthorizationUrl = '';
    this.accessTokenForm.patchValue({
      redirectUrl: this.configInputs.controls.redirectUrl.value,
      responseType: this.configInputs.controls.responseType.value || 'code',
      state: this.configInputs.controls.state.value || 'acdfgb',
      scope: this.configInputs.controls.scope.value || 'collection',
      authorizationCode: '',
    });
    this.accessTokenModalVisible = true;
  }

  generateAuthorizationUrl() {
    if (this.accessTokenForm.invalid) {
      this.accessTokenForm.markAllAsTouched();
      return;
    }

    const formValue = this.accessTokenForm.getRawValue();
    const authorizationUrl = new URL(formValue.url);
    authorizationUrl.searchParams.set('redirect_uri', formValue.redirectUrl);
    authorizationUrl.searchParams.set('response_type', formValue.responseType);
    authorizationUrl.searchParams.set('state', formValue.state);
    authorizationUrl.searchParams.set('scope', formValue.scope);
    this.generatedAuthorizationUrl = authorizationUrl.toString();
    this.configInputs.patchValue({
      redirectUrl: formValue.redirectUrl,
      responseType: formValue.responseType,
      state: formValue.state,
      scope: formValue.scope,
    });
    window.open(this.generatedAuthorizationUrl, '_blank', 'noopener,noreferrer');
    this.awaitingAuthorizationCode = true;
  }

  submitAuthorizationCode() {
    const authorizationCode =
      this.accessTokenForm.controls.authorizationCode.value.trim();

    if (!authorizationCode) {
      this.accessTokenForm.controls.authorizationCode.setErrors({
        required: true,
      });
      this.accessTokenForm.controls.authorizationCode.markAsTouched();
      return;
    }

    this.configInputs.patchValue({ accessToken: authorizationCode });
    this.accessTokenModalVisible = false;
  }
  showOtp: boolean = false;
  Credentials = <bankAccount[]>[];

  ngAfterViewInit(): void {
    const editData = this.location.getState() as any;
    const branches$ = this.httpClient.get<Branch[]>('data/branches.json');
    const firms$ = this.httpClient.get<Firm[]>('data/firms.json');
    if (editData.action === 'view') {
      forkJoin({
        branches: branches$,
        firms: firms$,
        account: this.http.get('bankAccount', { id: editData.id }),
      }).subscribe({
        next: ({ branches, firms, account }) => {
          this.branches = branches;
          this.firms = firms;
          const data = account.data || account;

          this.configInputs.patchValue({
            ...data,
            firmId: Number(data.firmId),
            branchId: String(data.branchId),
          });
        },
        error: (err) => this.showLoadError(err),
      });
      return;
    }

    forkJoin({ branches: branches$, firms: firms$ }).subscribe({
      next: ({ branches, firms }) => {
        this.branches = branches;
        this.firms = firms;
      },
      error: (err) => this.showLoadError(err),
    });
  }

  private showLoadError(err: any): void {
    this.dialogSrc.swal({
      dialog: 'error',
      message: err.message,
    });
  }

  save() {
    if (this.configInputs.invalid) {
      this.configInputs.markAllAsTouched();
      return;
    }

    const { ...formValue } =
      this.configInputs.getRawValue();
    const bankData: bankAccount = {
      ...formValue,
      credDate: formValue.credDate ?? undefined,
      credUser: formValue.credUser ?? undefined,
    };

    this.isConfSubmitting = true;
    this.http.post('bankAccount/save', bankData).subscribe({
      next: (res) => {
        this.dialogSrc.swal({
          dialog: 'success',
          message: 'Record Update Successfully',
        });
        this.refreshService.trigger();
        this.configInputs.patchValue(res);
        this.finishSave();
      },
      error: (err) => {
        this.dialogSrc.swal({
          dialog: 'error',
          message: err.message,
        });
        this.isConfSubmitting = false;
      },
    });
  }

  isPasswordEmpty(): boolean {
    return !this.passwordModalForm.controls.password.value;
  }

  sendEncryptedPsw() {
    const password = this.passwordModalForm.controls.password.value;
    const key = this.configInputs.controls.enc_Key.value;

    if (!password || !key) {
      this.passwordModalForm.controls.password.markAsTouched();

      return;
    }

    this.passwordModalForm.patchValue({
      encrypted_psw: this.encrypt(password, key),
      mobile_no: '917083234537',
    });

    this.showOtp = true;
  }

  encrypt(password: string, key: string): string {
    const encryptedValues: number[] = [];

    for (let index = 0; index < password.length; index++) {
      const fromChar = password.charCodeAt(index);
      const toChar = index < key.length ? key.charCodeAt(index) : 9;
      encryptedValues.push(fromChar ^ toChar);
    }

    return encryptedValues.join('a');
  }

  savePasswordModalData() {
    if (this.passwordModalForm.invalid || !this.passwordTarget) {
      this.passwordModalForm.markAllAsTouched();
      return;
    }

    const encryptedPassword = this.passwordModalForm.controls.encrypted_psw.value;
    this.configInputs.patchValue(
      this.passwordTarget === 'login'
        ? { apiLoginPassword: encryptedPassword }
        : { apiTxnPassword: encryptedPassword },
    );
    this.closePasswordModal();
  }



  private finishSave() {
    this.passwordModalForm.reset();
    this.showOtp = false;
    this.isConfSubmitting = false;
  }

  closePage() {
    this.location.back();
  }
}
