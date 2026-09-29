import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconModule } from '@coreui/icons-angular';
import { cilArrowRight, cilBank, cilBan, cilCalendar, cilFile, cilPlus, cilQrCode } from '@coreui/icons';

const base = '/dashboard/dashboard-form/';
const dashboards = {
  single: {
    title: 'Single Payment', tag: 'INDIVIDUAL PAYMENTS', icon: cilBank,
    description: 'Review individual payment requests, follow their status, and update payment records in your ERP.',
    services: [
      {
        title: 'Payment Requests', category: 'REVIEW & PROCESS', theme: 'blue', icon: cilPlus,
        description: 'Review pending payment requests and process selected payments.',
        details: ['Review beneficiary and account details', 'Process pending requests'], action: 'View requests', route: base + 'singal-payment-request-Approval'
      },
      {
        title: 'Payment Status', category: 'TRACK PAYMENTS', theme: 'amber', icon: cilCalendar,
        description: 'Check payment progress and refresh bank status and transaction references.',
        details: ['Check payment status', 'Review UTR details'], action: 'Check status', route: base + 'paymentStatus'
      },
      {
        title: 'ERP Update', category: 'RETRY MISSED UPDATES', theme: 'teal', icon: cilFile,
        description: 'Retry automatic ERP status updates missed because of an internet interruption or API error.',
        details: ['Review successful payments not updated in ERP', 'Retry the ERP status update'], action: 'Retry ERP update', route: base + 'paymentErpUpdate'
      },
    ],
  },
  bulk: {
    title: 'Bulk Payment', tag: 'BATCH PAYMENTS', icon: cilBank,
    description: 'Manage multiple payments together, from pending requests and initialization through to bank status.',
    services: [
      {
        title: 'Payment Requests', category: 'REVIEW REQUESTS', theme: 'blue', icon: cilPlus,
        description: 'Review pending bulk payment requests and process the selected records.',
        details: ['Review pending payments', 'Process selected requests'], action: 'View requests', route: base + 'batches-request-Approval'
      },
      {
        title: 'Initialize Payments', category: 'PREPARE PAYMENTS', theme: 'amber', icon: cilCalendar,
        description: 'Review payments awaiting initialization and start bulk payment processing.',
        details: ['Review payment details', 'Initialize selected payments'], action: 'Initialize payments', route: base + 'bulkPaymentInitialize'
      },
      {
        title: 'Payment Status', category: 'FOLLOW PROGRESS', theme: 'teal', icon: cilFile,
        description: 'Check the status of submitted bulk payments and review returned results.',
        details: ['Track bulk payments', 'Review processing results'], action: 'Check status', route: base + 'bulkPaymentStatus'
      },
    ],
  },
  vpa: {
    title: 'VPA & QR Banking', tag: 'VIRTUAL PAYMENT ADDRESS', icon: cilQrCode,
    description: 'Explore virtual payment address services and QR statements.',
    services: [
      {
        title: 'VPA Creation', category: 'CREATE VPA', theme: 'blue', icon: cilPlus,
        description: 'Create a virtual payment address to receive payments.',
        details: ['Review bank account and merchant details', 'Create a virtual payment address'], action: 'Create VPA', route: base + 'vpaCreation'
      },
      {
        title: 'VPA Deactivation', category: 'MANAGE VPA', theme: 'amber', icon: cilBan,
        description: 'Deactivate a virtual payment address that is no longer needed.',
        details: ['Review existing virtual payment addresses', 'Deactivate a VPA'], action: 'Deactivate VPA', route: base + 'vpaDeactivation'
      },
      {
        title: 'QR Statement', category: 'QR ENQUIRY', theme: 'teal', icon: cilQrCode,
        description: 'Open the QR statement form with merchant, terminal, and date filters. This form currently shows a sample response.',
        details: ['Enter merchant and terminal details', 'Choose a date range'], action: 'Open QR statement', route: base + 'qrStatement'
      },
      {
        title: 'Generated UPI QR', category: 'GENERATED QR RECORDS', theme: 'blue', icon: cilQrCode,
        description: 'View generated QR records for the selected bank.',
        details: ['Customer, document, and reference details', 'Dynamic and static QR records'], action: 'View generated QR list', route: base + 'qrGenerated'
      },
    ],
  },
};

@Component({
  selector: 'app-payment-services',
  standalone: true,
  imports: [RouterLink, IconModule],
  templateUrl: './payment-services.component.html',
  styleUrl: '../../settings/virtual-accounts/virtual-accounts.component.scss',
  styles: [`
    .service-card[aria-disabled="true"] { cursor: default; }
    .service-card[aria-disabled="true"]:hover { transform: none; border-color: var(--cui-border-color, #e1e7ef); box-shadow: none; }
  `],
})
export class PaymentServicesComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  readonly dashboard = computed(() => dashboards[this.routeData()['service'] as keyof typeof dashboards] ?? dashboards.single);
  readonly icons = { arrow: cilArrowRight };
}
