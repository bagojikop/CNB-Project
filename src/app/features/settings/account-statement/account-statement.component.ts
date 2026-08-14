import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';

@Component({
  selector: 'app-account-statement',
  imports: [CommonModule, ReactiveFormsModule, DSS_FORM_CONTROLS],
  templateUrl: './account-statement.component.html',
  styleUrl: './account-statement.component.scss',
})
export class AccountStatementComponent {
  private fb = inject(FormBuilder);

  allData: any[] = [
    {
      Response: {
        status: {
          contextID: 'e8230231-6511-4cf7-bf65-d3a0b48521fe-00000f8b,0',
          message: {
            code: '0',
            type: 'INFO',
          },
          result: 'SUCCESSFUL',
        },
        body: {
          statementResponse: {
            branchCode: '402',
            currencyCode: 'INR',
            branchName: 'POLLACHI',
          },
          encryptData: {
            acctNumber: '0402256027830',
            customerShortName: 'CUSTOMER INDIA PVT LTD',
            openingBalance: '2373102848.52',
            closingBalance: '2369901637.52',
            transactions: [
              {
                transactionDate: '20240904113042',
                description:
                  'IB NEFT Dr P248240238636542 AWADESH SINGH  BARB0DURGAP 00440100018759 nrtv',
                valueDate: '20240126000000',
                creditDebitFlag: 'D',
                transactionAmount: '33285.00',
                runningBalance: '2373069563.52',
                txnRefNumber: '100050000000262024007',
                userRefNumber: 'P248240238636542',
              },
              {
                transactionDate: '20240904113042',
                description: 'SC NEFT OTHER THAN SB IMB',
                valueDate: '20240131000000',
                creditDebitFlag: 'D',
                transactionAmount: '6.00',
                runningBalance: '2373069557.52',
                txnRefNumber: '100050000000262024007',
                userRefNumber: 'P248240238636542',
              },
              {
                transactionDate: '20240904171953',
                description:
                  'IB NEFT Dr P248240238639759 ZETWERK MANUFACTURING BUSINESSES PVT LTD  HDFC0000076 50200039900190 Fund Transfer from 1228',
                valueDate: '20240126000000',
                creditDebitFlag: 'D',
                transactionAmount: '10.00',
                runningBalance: '2373069547.52',
                txnRefNumber: '24090400001031',
                userRefNumber: 'P248240238639759',
              },
              {
                transactionDate: '20240904171953',
                description: 'SC NEFT OTHER THAN SB IMB',
                valueDate: '20240131000000',
                creditDebitFlag: 'D',
                transactionAmount: '3.00',
                runningBalance: '2373069544.52',
                txnRefNumber: '24090400001031',
                userRefNumber: 'P248240238639759',
              },
            ],
          },
        },
      },
      showTransactions: false,
    },
  ];

  jsonData: any[] = [];

  ngOnInit() {
    this.jsonData = this.allData.map((item) => {
      const encryptData = item.Response.body.encryptData;
      return {
        customerName: encryptData.customerShortName,
        openingBalance: parseFloat(encryptData.openingBalance),
        closingBalance: parseFloat(encryptData.closingBalance),
        fromDate:
          encryptData.transactions.length > 0
            ? encryptData.transactions[0].transactionDate.substring(0, 8)
            : '',
        endDate:
          encryptData.transactions.length > 0
            ? encryptData.transactions[
                encryptData.transactions.length - 1
              ].transactionDate.substring(0, 8)
            : '',
        transactions: encryptData.transactions.map((txn: any) => ({
          date: txn.transactionDate,
          description: txn.description,
          debit:
            txn.creditDebitFlag === 'D'
              ? parseFloat(txn.transactionAmount)
              : '',
          credit:
            txn.creditDebitFlag === 'C'
              ? parseFloat(txn.transactionAmount)
              : '',
          balance: parseFloat(txn.runningBalance),
        })),
        showTransactions: false,
      };
    });
  }

  // Form group for filters
  filterForm: FormGroup = this.fb.group({
    accountNo: [''],
    fromDate: [''],
    endDate: [''],
  });

  // Modal properties
  selectedAccount: any = null;
  showModal: boolean = false;

  openModal(account: any) {
    this.selectedAccount = account;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedAccount = null;
  }

  getTotalDebit(transactions: any[]): number {
    return transactions.reduce(
      (sum, txn) => sum + (typeof txn.debit === 'number' ? txn.debit : 0),
      0,
    );
  }

  getTotalCredit(transactions: any[]): number {
    return transactions.reduce(
      (sum, txn) => sum + (typeof txn.credit === 'number' ? txn.credit : 0),
      0,
    );
  }

  getTotalBalance(transactions: any[]): number {
    if (transactions.length === 0) return 0;
    const lastTxn = transactions[transactions.length - 1];
    return typeof lastTxn.balance === 'number' ? lastTxn.balance : 0;
  }

  showResult() {
    // Get raw values from form
    const accountNo = this.filterForm.get('accountNo')?.value || '';
    const fromDate = this.filterForm.get('fromDate')?.value || '';
    const endDate = this.filterForm.get('endDate')?.value || '';

    console.log('=== Filters ===');
    console.log('Account No:', accountNo);
    console.log('From Date:', fromDate);
    console.log('End Date:', endDate);
    console.log('All Data:', this.allData);

    // If no filters, show all data
    if (!accountNo && !fromDate && !endDate) {
      this.jsonData = [...this.allData];
      console.log('No filters - showing all data');
      return;
    }

    // Apply filters
    this.jsonData = this.allData.filter((item) => {
      let match = true;

      // Filter by Account No (customer name)
      if (accountNo) {
        match =
          match &&
          item.customerName
            .toLowerCase()
            .includes(accountNo.toLowerCase().trim());
      }

      // Filter by From Date (only compare if fromDate is provided)
      if (fromDate) {
        // Parse dates for proper comparison
        const itemDate = new Date(item.fromDate);
        const filterDate = new Date(fromDate);
        // Reset time to compare only dates
        itemDate.setHours(0, 0, 0, 0);
        filterDate.setHours(0, 0, 0, 0);
        // Check if item.fromDate is on or after the filter date
        match = match && itemDate >= filterDate;
      }

      // Filter by End Date (only compare if endDate is provided)
      if (endDate) {
        // Parse dates for proper comparison
        const itemDate = new Date(item.endDate);
        const filterDate = new Date(endDate);
        // Reset time to compare only dates
        itemDate.setHours(0, 0, 0, 0);
        filterDate.setHours(0, 0, 0, 0);
        // Check if item.endDate is on or before the filter date
        match = match && itemDate <= filterDate;
      }

      console.log('Item:', item.customerName, 'Match:', match);
      return match;
    });

    console.log('Filtered Data Count:', this.jsonData.length);
    console.log('Filtered Data:', this.jsonData);
  }
}
