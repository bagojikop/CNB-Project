import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface VANPayment {
  id: number;
  vanNumber: string;
  customerName: string;
  customerId: string;
  amount: number;
  paymentDate: Date;
  invoiceNumber: string;
  status: 'matched' | 'pending';
}

@Component({
  selector: 'app-payment-received-by-van',
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-received-by-van.component.html',
  styleUrl: './payment-received-by-van.component.scss',
})
export class PaymentReceivedByVANComponent implements OnInit {
  payments: VANPayment[] = [];
  filteredPayments: VANPayment[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';

  private _currentPage: number = 1;
  get currentPage(): number {
    return this._currentPage;
  }
  set currentPage(value: number) {
    this._currentPage = value;
    this.filterPayments();
  }

  totalPages: number = 1;
  showDetailsModal: boolean = false;
  selectedPayment: VANPayment | null = null;

  // Summary stats
  totalVans: number = 0;
  totalReceived: number = 0;
  autoMatched: number = 0;
  pendingMatch: number = 0;
  totalPayments: number = 0;

  ngOnInit(): void {
    this.generateMockData();
    this.filterPayments();
  }

  generateMockData(): void {
    const customers = [
      { name: 'Rajesh Sharma', id: 'CUST001' },
      { name: 'Priya Patel', id: 'CUST002' },
      { name: 'Amit Kumar', id: 'CUST003' },
      { name: 'Sneha Reddy', id: 'CUST004' },
      { name: 'Vikram Singh', id: 'CUST005' },
      { name: 'Anita Desai', id: 'CUST006' },
      { name: 'Ravi Gupta', id: 'CUST007' },
      { name: 'Meera Joshi', id: 'CUST008' },
    ];

    const now = new Date();
    this.payments = [];

    for (let i = 0; i < 25; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const status = Math.random() > 0.3 ? 'matched' : 'pending';
      const amount = Math.floor(Math.random() * 50000) + 5000;
      const date = new Date(now);
      date.setHours(now.getHours() - Math.floor(Math.random() * 48));
      date.setMinutes(Math.floor(Math.random() * 60));

      this.payments.push({
        id: i + 1,
        vanNumber: `VAN${String(10000 + Math.floor(Math.random() * 90000))}`,
        customerName: customer.name,
        customerId: customer.id,
        amount: Math.round(amount / 100) * 100,
        paymentDate: date,
        invoiceNumber: String(10000 + Math.floor(Math.random() * 90000)),
        status: status as 'matched' | 'pending',
      });
    }

    // Sort by date descending
    this.payments.sort(
      (a, b) => b.paymentDate.getTime() - a.paymentDate.getTime(),
    );
    this.updateStats();
  }

  updateStats(): void {
    const uniqueVans = new Set(this.payments.map((p) => p.vanNumber));
    this.totalVans = uniqueVans.size;
    this.totalReceived = this.payments.reduce((sum, p) => sum + p.amount, 0);
    this.autoMatched = this.payments.filter(
      (p) => p.status === 'matched',
    ).length;
    this.pendingMatch = this.payments.filter(
      (p) => p.status === 'pending',
    ).length;
    this.totalPayments = this.payments.length;
  }

  filterPayments(): void {
    let filtered = this.payments;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.vanNumber.toLowerCase().includes(term) ||
          p.customerName.toLowerCase().includes(term) ||
          p.customerId.toLowerCase().includes(term) ||
          p.invoiceNumber.includes(term),
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === this.statusFilter);
    }

    // Update total pages based on filtered results
    this.totalPages = Math.ceil(filtered.length / 10);

    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    // Apply pagination
    const startIndex = (this.currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    this.filteredPayments = filtered.slice(startIndex, endIndex);
  }

  viewDetails(payment: VANPayment): void {
    this.selectedPayment = payment;
    this.showDetailsModal = true;
  }

  matchManually(): void {
    if (this.selectedPayment) {
      this.selectedPayment.status = 'matched';
      this.updateStats();
      this.filterPayments();
      this.showDetailsModal = false;
      // In real app, this would call an API
    }
  }

  refreshData(): void {
    this.generateMockData();
    this.filterPayments();
  }
}
