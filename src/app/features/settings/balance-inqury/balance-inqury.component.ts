import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';

interface BalanceResponse {
  status: string;
  statusCode: string;
  message: string;
  responseTime: string;
  requestId: string;
  accountDetails: {
    accountNumber: string;
    accountName: string;
    accountType: string;
    currency: string;
    branchName: string;
    ifscCode: string;
  };
  balanceDetails: {
    availableBalance: number;
    ledgerBalance: number;
    unclearedBalance: number;
    holdAmount: number;
    minimumBalance: number;
    overdraftLimit: number;
    utilizedOverdraft: number;
  };
}

@Component({
  selector: 'app-balance-inquiry',
  templateUrl: './balance-inqury.component.html',
  styleUrls: ['./balance-inqury.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, DSS_FORM_CONTROLS],
  standalone: true,
})
export class BalanceInquiryComponent {
  balanceForm: FormGroup;
  isLoading = false;
  balanceData: BalanceResponse | null = null;

  constructor(private fb: FormBuilder) {
    this.balanceForm = this.fb.group({
      encryptData: this.fb.group({
        accountNumber: [
          '',
          [Validators.required, Validators.pattern(/^\d{9,18}$/)],
        ],
      }),
    });
  }

  fetchBalance() {
    if (this.balanceForm.invalid) {
      this.balanceForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.balanceData = null;
    const requestBody = {
      Request: {
        body: {
          encryptData: this.balanceForm.value.encryptData,
        },
      },
    };
    console.log('Request body:', requestBody);

    // Simulate API call with the provided response
    setTimeout(() => {
      this.isLoading = false;
      // Mock response data matching the provided JSON
      this.balanceData = {
        status: 'SUCCESS',
        statusCode: '200',
        message: 'Balance inquiry successful',
        responseTime: '2026-08-03T16:30:45',
        requestId: 'BI20260803163045001',
        accountDetails: {
          accountNumber: 'XXXXXXXX1234',
          accountName: 'ABC Traders Pvt Ltd',
          accountType: 'Current',
          currency: 'INR',
          branchName: 'Sangli Branch',
          ifscCode: 'SBIN0001234',
        },
        balanceDetails: {
          availableBalance: 125450.75,
          ledgerBalance: 130000.75,
          unclearedBalance: 4549.99,
          holdAmount: 2500.0,
          minimumBalance: 10000.0,
          overdraftLimit: 50000.0,
          utilizedOverdraft: 12000.0,
        },
      };
      console.log('Balance data:', this.balanceData);
    }, 1500);
  }
}
