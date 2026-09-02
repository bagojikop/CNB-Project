import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '@shared-services/auth.service';

@Component({
  selector: 'app-admin-setup',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-setup.component.html',
  styleUrl: './admin-setup.component.scss',
})
export class AdminSetupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  loading = false;
  errorMessage = '';
  showPassword = false;

  readonly setupForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(4)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  createAdmin(): void {
    this.errorMessage = '';
    if (this.setupForm.invalid) {
      this.setupForm.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...admin } = this.setupForm.getRawValue();
    if (admin.password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;
    this.auth.createFirstAdmin(admin).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (response) => {
        if (response.status_cd === 1) {
          void this.router.navigateByUrl('/login', {
            state: { adminCreated: true },
            replaceUrl: true,
          });
          return;
        }
        this.errorMessage = response.errors?.message || 'Unable to create the administrator.';
      },
      error: (error) => {
        this.errorMessage = error?.error?.errors?.message || error?.error?.message ||
          'Unable to create the administrator. Please try again.';
      },
    });
  }
}
