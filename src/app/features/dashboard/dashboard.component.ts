import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { IconModule } from '@coreui/icons-angular';
import {
  cilBank,
  cilQrCode,
  cilCreditCard,
  cilList,
  cilCheckCircle,
  cilClock,
} from '@coreui/icons';
import { DSS_FORM_CONTROLS } from '@shared-directives/dss-form-controls';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { catchError, filter, forkJoin, of } from 'rxjs';
import { Http } from '@shared-services/httpService';
import { MyProvider } from '@shared-services/provider';

interface PendingCount {
  id: number;
  value: number;
}

interface BankCard {
  id: number;
  title: string;
  count: number;
  icon: string;
  color: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DSS_FORM_CONTROLS, IconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  showDashboard = true;
  private router = inject(Router);
  private http = inject(Http);
  private provider = inject(MyProvider);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showDashboard = this.router.url === '/dashboard';
      });
  }

  ngOnInit(): void {
    const branchId = this.provider.companyInfo?.company?.branch_id;


    const params = { branch_id: branchId || '' };
    forkJoin([
      this.http
        .get<PendingCount | null>('Dashoboard/pending-create-counts', params)
        .pipe(catchError(() => of(null))),
      this.http
        .get<PendingCount | null>('Dashoboard/pending-status-counts', params)
        .pipe(catchError(() => of(null))),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        this.bankCards = this.bankCards.map((card) => ({
          ...card,
          count: results.find((result) => result?.id === card.id)?.value ?? 0,
        }));
      });
  }

  icons = {
    cilBank,
    cilQrCode,
    cilCreditCard,
    cilList,
    cilCheckCircle,
    cilClock,
  };

  bankCards: BankCard[] = [
    {
      id: 1,
      title: 'Singal Payment Request Pending',
      count: 0,
      icon: 'cilClock',
      color: 'warning',
    },
    {
      id: 2,
      title: 'Bulk Payment Request Pending',
      count: 0,
      icon: 'cilClock',
      color: 'secondary',
    },

    {
      id: 3,
      title: 'Payment Received by VAN',
      count: 0,
      icon: 'cilBank',
      color: 'success',
    },
    {
      id: 4,
      title: 'Payment Received by QR',
      count: 0,
      icon: 'cilQrCode',
      color: 'info',
    },
    {
      id: 5,
      title: 'Payment Status',
      count: 0,
      icon: 'cilCreditCard',
      color: 'primary',
    },
    {
      id: 6,
      title: 'QR Status',
      count: 0,
      icon: 'cilCheckCircle',
      color: 'secondary',
    },
    // {
    //   id: 7,
    //   title: 'Batch Status',
    //   count: 8,
    //   icon: 'cilList',
    //   color: 'danger',
    // },
    {
      id: 8,
      title: 'VAN Expiry Status',
      count: 0,
      icon: 'cilList',
      color: 'danger',
    },
  ];

  // Returns CSS classes for colors
  getColorClass(color: string): string {
    const colorMap: Record<string, string> = {
      primary: 'bg-primary text-white',
      secondary: 'bg-secondary text-white',
      success: 'bg-success text-white',
      danger: 'bg-danger text-white',
      warning: 'bg-warning text-dark',
      info: 'bg-info text-white',
      light: 'bg-light text-dark',
      dark: 'bg-dark text-white',
    };
    return colorMap[color] || 'bg-light text-dark';
  }

  // Returns hex color for inline styles
  getIconColor(color: string): string {
    const colors: Record<string, string> = {
      primary: '#0d6efd',
      secondary: '#6c757d',
      success: '#28a745',
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
      light: '#f8f9fa',
      dark: '#343a40',
    };

    return colors[color] || colors['primary'];
  }

  onCardClick(card: BankCard): void {
    switch (card.id) {
      case 1:
        this.glob_Routing(
          '/dashboard/dashboard-form/singal-payment-request-Approval',
        );
        break;

      case 2:
        this.glob_Routing('/dashboard/dashboard-form/batches-request-Approval');
        break;

      case 3:
        this.glob_Routing('/dashboard/dashboard-form/paymentReceivedByVAN');
        break;

      case 5:
        this.glob_Routing('/dashboard/dashboard-form/paymentStatus');
        break;

      case 6:
        this.glob_Routing('/dashboard/dashboard-form/qrStatement');
        break;

      case 7:
        this.glob_Routing('/dashboard/dashboard-form/batchStatus');
        break;

      case 8:
        this.glob_Routing('/dashboard/dashboard-form/VANExpiryStatus');
        break;
    }
  }

  glob_Routing(path: string) {
    this.router.navigate([path]);
  }
}
