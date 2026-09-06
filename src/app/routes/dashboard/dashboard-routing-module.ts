import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BulkPaymentRequestComponent } from '@features/dashboard/bulk-payment-request/bulk-payment-request.component';
import { BatchStatusComponent } from '@features/dashboard/batch-status/batch-status.component';
import { PaymentReceivedByVANComponent } from '@features/dashboard/payment-received-by-van/payment-received-by-van.component';
import { PaymentRequestApprovalComponent } from '@features/dashboard/payment-request-approval/payment-request-approval.component';
import { PaymentStatusComponent } from '@features/dashboard/payment-status/payment-status.component';
import { QrStatusComponent } from '@features/dashboard/qr-status/qr-status.component';
import { VANExpiryStatusComponent } from '@features/dashboard/vanexpiry-status/vanexpiry-status.component';
const routes: Routes = [
  {
    path: 'singal-payment-request-Approval',
    component: PaymentRequestApprovalComponent,
  },
  {
    path: 'batches-request-Approval',
    component: BulkPaymentRequestComponent,
  },
  {
    path: 'VANExpiryStatus',
    component: VANExpiryStatusComponent,
  },
  {
    path: 'paymentReceivedByVAN',
    component: PaymentReceivedByVANComponent,
  },
  {
    path: 'paymentStatus',
    component: PaymentStatusComponent,
  },
  {
    path: 'batchStatus',
    component: BatchStatusComponent,
  },
  {
    path: 'qrStatement',
    component: QrStatusComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
