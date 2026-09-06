import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@shared-services/auth.service';
import { Http } from '@shared-services/httpService';
import { DialogsService } from '@shared-services/messageBox';
import { MyProvider } from '@shared-services/provider';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(Http);
  private readonly dialogs = inject(DialogsService);
  private readonly provider = inject(MyProvider);
  private readonly auth = inject(AuthService);

  submitting = false;
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  readonly form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  get passwordsMatch(): boolean {
    return this.form.controls.newPassword.value === this.form.controls.confirmPassword.value;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.passwordsMatch || this.submitting) return;

    this.submitting = true;
    const value = this.form.getRawValue();
    const user = this.provider.companyInfo?.user;

    this.http.post('auth/change-password', {
      id: user?.user_id ?? user?.id,
      current_password: value.currentPassword,
      new_password: value.newPassword,
    }).pipe(finalize(() => this.submitting = false)).subscribe({
      next: (response: any) => {
        if (response?.status_cd === 0) {
          void this.dialogs.swal({ dialog: 'error', message: response?.errors?.message ?? response?.error?.message ?? 'Unable to change password.' });
          return;
        }
        this.form.reset();
        void this.dialogs.swal({ dialog: 'success', message: 'Password changed successfully. Please sign in again.' }).then(() => this.auth.logout());
      },
      error: (error: any) => {
        void this.dialogs.swal({ dialog: 'error', message: error?.error?.errors?.message ?? error?.error?.message ?? 'Unable to change password.' });
      },
    });
  }
}
