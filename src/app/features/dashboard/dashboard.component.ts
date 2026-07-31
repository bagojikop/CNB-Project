import { Component, inject } from '@angular/core';
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
import { filter } from 'rxjs';

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
export class DashboardComponent {
  showDashboard = true;
  private router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showDashboard = this.router.url === '/dashboard';
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
      title: 'Payment Request Pending',
      count: 12,
      icon: 'cilClock',
      color: 'warning',
    },
    {
      id: 2,
      title: 'Payment Received by VAN',
      count: 45,
      icon: 'cilBank',
      color: 'success',
    },
    {
      id: 3,
      title: 'Payment Received by QR',
      count: 23,
      icon: 'cilQrCode',
      color: 'info',
    },
    {
      id: 4,
      title: 'Payment Status',
      count: 67,
      icon: 'cilCreditCard',
      color: 'primary',
    },
    {
      id: 5,
      title: 'QR Status',
      count: 34,
      icon: 'cilCheckCircle',
      color: 'secondary',
    },
    {
      id: 6,
      title: 'Batch Status',
      count: 8,
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
        this.glob_Routing('/dashboard/dashboard-form/payment-request-Approval');
        break;
    }
  }

  glob_Routing(path: string) {
    this.router.navigate([path]);
  }
}
