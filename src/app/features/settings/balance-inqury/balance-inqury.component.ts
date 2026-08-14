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
  balanceData: BalanceResponse[] | null = null;
  filteredData: BalanceResponse[] | null = null;
  branches: string[] = [
    'Sangli Branch',
    'Mumbai Branch',
    'Pune Branch',
    'Delhi Branch',
  ];

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalRecords = 0;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(private fb: FormBuilder) {
    this.balanceForm = this.fb.group({
      branch: ['', Validators.required],
      accountNumber: ['', [Validators.pattern(/^\d{9,18}$/)]],
    });
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get pagedData(): BalanceResponse[] | null {
    if (!this.filteredData || this.filteredData.length === 0) {
      return null;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  // Utility method for template to avoid Math.min error
  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }

  fetchBalance() {
    if (this.balanceForm.invalid) {
      this.balanceForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.balanceData = null;
    const branch = this.balanceForm.value.branch;
    const accountNumber = this.balanceForm.value.accountNumber;
    const requestBody = {
      branch: branch,
      accountNumber: accountNumber,
    };
    console.log('Request body:', requestBody);

    // Simulate API call with multiple account responses
    setTimeout(() => {
      this.isLoading = false;
      // Mock response data with multiple accounts (15 accounts for pagination demo)
      const mockAccounts = [
        {
          accountNumber: '123456789012',
          accountName: 'ABC Traders Pvt Ltd',
          accountType: 'Current',
          availableBalance: 125450.75,
          ledgerBalance: 130000.75,
          ifscCode: 'SBIN0001234',
        },
        {
          accountNumber: '987654321098',
          accountName: 'XYZ Enterprises',
          accountType: 'Savings',
          availableBalance: 87550.5,
          ledgerBalance: 90000.5,
          ifscCode: 'SBIN0005678',
        },
        {
          accountNumber: '456789012345',
          accountName: 'PQR Industries',
          accountType: 'Current',
          availableBalance: 203450.25,
          ledgerBalance: 210000.25,
          ifscCode: 'SBIN0009012',
        },
        {
          accountNumber: '111222333444',
          accountName: 'LMN Solutions',
          accountType: 'Savings',
          availableBalance: 45200.0,
          ledgerBalance: 48000.0,
          ifscCode: 'SBIN0003456',
        },
        {
          accountNumber: '555666777888',
          accountName: 'RST Global',
          accountType: 'Current',
          availableBalance: 312500.0,
          ledgerBalance: 320000.0,
          ifscCode: 'SBIN0007890',
        },
        {
          accountNumber: '999888777666',
          accountName: 'UVW Traders',
          accountType: 'Current',
          availableBalance: 67800.75,
          ledgerBalance: 70000.75,
          ifscCode: 'SBIN0002345',
        },
        {
          accountNumber: '333444555666',
          accountName: 'DEF Associates',
          accountType: 'Savings',
          availableBalance: 153200.0,
          ledgerBalance: 158000.0,
          ifscCode: 'SBIN0006789',
        },
        {
          accountNumber: '777888999000',
          accountName: 'GHI Ventures',
          accountType: 'Current',
          availableBalance: 94500.25,
          ledgerBalance: 98000.25,
          ifscCode: 'SBIN0000123',
        },
        {
          accountNumber: '222333444555',
          accountName: 'JKL Holdings',
          accountType: 'Savings',
          availableBalance: 286000.5,
          ledgerBalance: 290000.5,
          ifscCode: 'SBIN0004567',
        },
        {
          accountNumber: '666777888999',
          accountName: 'MNO Corporation',
          accountType: 'Current',
          availableBalance: 78900.0,
          ledgerBalance: 81000.0,
          ifscCode: 'SBIN0008901',
        },
        {
          accountNumber: '444555666777',
          accountName: 'STU Group',
          accountType: 'Savings',
          availableBalance: 124300.75,
          ledgerBalance: 128000.75,
          ifscCode: 'SBIN0002345',
        },
        {
          accountNumber: '888999000111',
          accountName: 'VWX Solutions',
          accountType: 'Current',
          availableBalance: 56750.25,
          ledgerBalance: 59000.25,
          ifscCode: 'SBIN0006789',
        },
        {
          accountNumber: '000111222333',
          accountName: 'YZA Traders',
          accountType: 'Savings',
          availableBalance: 93200.0,
          ledgerBalance: 96000.0,
          ifscCode: 'SBIN0000123',
        },
        {
          accountNumber: '333555777999',
          accountName: 'BCD Enterprises',
          accountType: 'Current',
          availableBalance: 178500.5,
          ledgerBalance: 185000.5,
          ifscCode: 'SBIN0004567',
        },
        {
          accountNumber: '666444888222',
          accountName: 'EFG Industries',
          accountType: 'Savings',
          availableBalance: 215000.25,
          ledgerBalance: 220000.25,
          ifscCode: 'SBIN0008901',
        },
      ];

      this.balanceData = mockAccounts.map((acc, index) => ({
        status: 'SUCCESS',
        statusCode: '200',
        message: 'Balance inquiry successful',
        responseTime: `2026-08-10T${16 + Math.floor(index / 10)}:${30 + (index % 60)}:${45 + index}`,
        requestId: `BI20260810163045${String(index + 1).padStart(3, '0')}`,
        accountDetails: {
          accountNumber: acc.accountNumber,
          accountName: acc.accountName,
          accountType: acc.accountType,
          currency: 'INR',
          branchName: branch,
          ifscCode: acc.ifscCode,
        },
        balanceDetails: {
          availableBalance: acc.availableBalance,
          ledgerBalance: acc.ledgerBalance,
          unclearedBalance: acc.availableBalance * 0.05,
          holdAmount: acc.availableBalance * 0.02,
          minimumBalance: acc.accountType === 'Savings' ? 5000 : 10000,
          overdraftLimit: acc.accountType === 'Current' ? 50000 : 25000,
          utilizedOverdraft: acc.accountType === 'Current' ? 12000 : 5000,
        },
      }));

      // Filter by account number if provided, otherwise show all accounts for the branch
      if (accountNumber && accountNumber.trim() !== '') {
        this.filteredData = this.balanceData.filter(
          (acc) => acc.accountDetails.accountNumber === accountNumber,
        );
      } else {
        this.filteredData = [...this.balanceData];
      }

      this.totalRecords = this.filteredData.length;
      this.currentPage = 1;
      console.log('Balance data:', this.balanceData);
      console.log('Filtered data:', this.filteredData);
    }, 1500);
  }
}
