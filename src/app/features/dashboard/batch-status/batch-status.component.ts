import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaymentService } from '@shared-services/user.service';
import { DialogsService } from '@shared-services/messageBox';
import { createBatchStatusForm } from './batchStatus.factory';

interface Payment {
  id: number;
  batchId: string;
  paymentType: string;
  totalAmount: number;
  partyName: string;
  paymentAgainst: string;
  requestDate: string;
  status: string;
  bankName: string;
  accountNo: string;
  requestedBy: string;
  transactionId?: string;
  transactionDate?: string;
  remarks?: string;
}

@Component({
  selector: 'app-batch-status',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './batch-status.component.html',
  styleUrl: './batch-status.component.scss',
})
export class BatchStatusComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private dialog = inject(DialogsService);
  readonly batchStatusForm = createBatchStatusForm(this.fb);

  statuses: string[] = [
    'Pending',
    'In Progress',
    'Completed',
    'Failed',
    'Success',
  ];
  submitted = false;
  batchStatusResult: any = null;
  payments: Payment[] = [];
  searchPerformed = false;
  isLoading = false;

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.paymentService.getAll().subscribe({
      next: (data) => {
        this.payments = data;
        console.log('Payments loaded from PaymentService:', this.payments);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading payments from PaymentService:', err);
        this.isLoading = false;
        // Fallback to hardcoded data for demo
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.batchStatusForm.invalid) {
      return;
    }

    const batchId = this.batchStatusForm.value.batchId;
    const status = this.batchStatusForm.value.status;

    // If payments are already loaded, filter locally
    if (this.payments.length > 0) {
      const payment = this.payments.find(
        (p) => p.batchId === batchId && p.status == status,
      );
      if (payment) {
        this.batchStatusResult = {
          batchId: payment.batchId,
          status: payment.status,
          statusMessage:
            payment.remarks || 'Status retrieved from payment data',
          totalAmount: payment.totalAmount,
          transactionCount:
            payment.paymentType === 'Bulk'
              ? (payment as any).bulkItems?.length || 1
              : 1,
          processedDate: payment.transactionDate || payment.requestDate,
          bankReferenceNo: payment.transactionId || '',
          errorCode: '',
          errorMessage: '',
        };
        this.searchPerformed = true;
      } else {
        this.dialog.swal({
          dialog: 'warning',
          message: 'No Data Found',
        });
      }
      return;
    }

    // If payments are not loaded, fetch all and then filter
    this.isLoading = true;
    this.paymentService.getAll().subscribe({
      next: (data) => {
        this.payments = data;
        this.isLoading = false;
        const payment = this.payments.find(
          (p) => p.batchId === batchId && p.status == status,
        );
        if (payment) {
          this.batchStatusResult = {
            batchId: payment.batchId,
            status: payment.status,
            statusMessage:
              payment.remarks || 'Status retrieved from payment data',
            totalAmount: payment.totalAmount,
            transactionCount:
              payment.paymentType === 'Bulk'
                ? (payment as any).bulkItems?.length || 1
                : 1,
            processedDate: payment.transactionDate || payment.requestDate,
            bankReferenceNo: payment.transactionId || '',
            errorCode: '',
            errorMessage: '',
          };
          this.searchPerformed = true;
        } else {
          this.batchStatusResult = {
            ...this.batchStatusForm.value,
            processedDate:
              this.batchStatusForm.value.processedDate ||
              new Date().toISOString().split('T')[0],
            statusMessage: 'No payment found with this Batch ID',
          };
          this.searchPerformed = true;
        }
      },
      error: (err) => {
        console.error('Error loading payments:', err);

        this.isLoading = false;
        // Fallback: use hardcoded data
      },
    });
  }

  get f() {
    return this.batchStatusForm.controls;
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      Pending: 'status-pending',
      'In Progress': 'status-in-progress',
      Completed: 'status-completed',
      Failed: 'status-failed',
      Success: 'status-completed',
    };
    return statusMap[status] || '';
  }
}
