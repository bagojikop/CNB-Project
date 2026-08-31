import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { AuthService } from '@shared-services/auth.service';
import { DialogsService } from '@shared-services/messageBox';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(DialogsService);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  errorMessage = '';
  showPassword = false;
  recoveryStep: 'login' | 'account' | 'otp' | 'password' = 'login';
  recoveryLoading = false;
  recoveryError = '';
  maskedEmail = '';
  maskedMobile = '';
  recoveryToken = '';

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  readonly accountForm = this.fb.nonNullable.group({ identifier: ['', Validators.required] });
  readonly otpForm = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });
  readonly resetPasswordForm = this.fb.nonNullable.group({
    temporaryPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  login(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMessage = '';
    this.auth.login(this.loginForm.getRawValue()).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); }),
    ).subscribe({
      next: (response) => {
        if (response.status_cd !== 1) this.errorMessage = response.errors?.message || 'Invalid username or password.';
      },
      error: (error) => {
        this.errorMessage = error?.error?.error?.message || error?.error?.message || 'Unable to sign in. Please try again.';
      },
    });
  }

  forgotPassword(): void { this.recoveryStep = 'account'; this.recoveryError = ''; }

  findRecoveryAccount(): void {
    if (this.accountForm.invalid || this.recoveryLoading) { this.accountForm.markAllAsTouched(); return; }
    this.runRecovery(
      this.auth.findPasswordRecoveryAccount(this.accountForm.controls.identifier.value),
      (response) => {
        const data = response.data ?? {};
        this.maskedEmail = data.email_id ?? data.email ?? '';
        this.maskedMobile = data.mobileno ?? data.mobileNo ?? '';
        this.recoveryToken = data.RecoveryToken ?? data.recoveryToken ?? '';
        this.recoveryStep = 'otp';
      },
      'No account was found for the supplied details.',
    );
  }

  verifyRecoveryOtp(): void {
    if (this.otpForm.invalid || this.recoveryLoading) { this.otpForm.markAllAsTouched(); return; }
    this.runRecovery(
      this.auth.verifyPasswordRecoveryOtp(
        this.accountForm.controls.identifier.value,
        this.recoveryToken,
        this.otpForm.controls.otp.value,
      ),
      () => { this.recoveryStep = 'password'; },
      'The OTP is invalid or has expired.',
    );
  }

  resetForgottenPassword(): void {
    const form = this.resetPasswordForm;
    if (form.invalid || form.controls.newPassword.value !== form.controls.confirmPassword.value || this.recoveryLoading) {
      form.markAllAsTouched();
      if (form.controls.newPassword.value !== form.controls.confirmPassword.value) this.recoveryError = 'New password and confirm password must match.';
      return;
    }
    this.runRecovery(
      this.auth.resetForgottenPassword(this.recoveryToken, form.controls.temporaryPassword.value, form.controls.newPassword.value),
      () => {
        void this.dialog.swal({ dialog: 'success', title: 'Password updated', message: 'Your password has been changed. You can now sign in.' });
        this.closePasswordRecovery();
      },
      'Unable to update your password.',
    );
  }

  closePasswordRecovery(): void {
    this.recoveryStep = 'login';
    this.recoveryError = '';
    this.recoveryToken = '';
    this.maskedEmail = '';
    this.maskedMobile = '';
    this.accountForm.reset();
    this.otpForm.reset();
    this.resetPasswordForm.reset();
  }

  private runRecovery(request: Observable<any>, onSuccess: (response: any) => void, fallback: string): void {
    this.recoveryLoading = true;
    this.recoveryError = '';
    request.pipe(finalize(() => { this.recoveryLoading = false; this.cdr.detectChanges(); })).subscribe({
      next: (response) => {
        if (response.status_cd !== 1) { this.recoveryError = response.errors?.message || fallback; return; }
        onSuccess(response);
      },
      error: (error) => { this.recoveryError = error?.error?.error?.message || error?.error?.message || fallback; },
    });
  }
}
