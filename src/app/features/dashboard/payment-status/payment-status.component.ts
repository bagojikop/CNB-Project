import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';
import { CommonModule } from '@angular/common';
import { PaymentService } from '@shared-services/user.service';

@Component({
  selector: 'app-payment-status',
  templateUrl: './payment-status.component.html',
  styleUrls: ['./payment-status.component.scss'],
  imports: [ReactiveFormsModule, DSS_FORM_CONTROLS, CommonModule],
})
export class PaymentStatusComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private fb = inject(FormBuilder);

  searchForm!: FormGroup;
  searchResult: any = null;
  searchPerformed = false;
  isLoading = false;

  ngOnInit(): void {
    this.initSearchForm();
  }

  initSearchForm(): void {
    this.searchForm = this.fb.group({
      searchBatchId: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    this.searchPerformed = true;
    this.isLoading = true;
    this.searchResult = null;

    const searchValue = this.searchForm.get('searchBatchId')?.value?.trim();

    this.paymentService.getByBatchId(searchValue).subscribe({
      next: (payment) => {
        this.searchResult = payment;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching payment:', err);
        this.searchResult = null;
        this.isLoading = false;
      },
    });
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.searchResult = null;
    this.searchPerformed = false;
    this.isLoading = false;
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      Pending: 'badge-warning',
      Processing: 'badge-info',
      Success: 'badge-success',
      Failed: 'badge-danger',
      Rejected: 'badge-secondary',
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusIconClass(status: string): string {
    const classes: { [key: string]: string } = {
      Pending: 'status-pending',
      Processing: 'status-processing',
      Success: 'status-success',
      Failed: 'status-failed',
      Rejected: 'status-rejected',
    };
    return classes[status] || 'status-pending';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      Pending: 'cilClock',
      Processing: 'cilReload',
      Success: 'cilCheckCircle',
      Failed: 'cilXCircle',
      Rejected: 'cilBan',
    };
    return icons[status] || 'cilClock';
  }
}
