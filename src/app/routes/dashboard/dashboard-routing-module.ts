import { BulkPaymentInitializeComponent } from '@features/dashboard/bulk-payment-initialize/bulk-payment-initialize.component';
import { BulkPaymentStatusComponent } from '@features/dashboard/bulk-payment-status/bulk-payment-status.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BulkPaymentRequestComponent } from '@features/dashboard/bulk-payment-request/bulk-payment-request.component';
import { BatchStatusComponent } from '@features/dashboard/batch-status/batch-status.component';
import { PaymentReceivedByVANComponent } from '@features/dashboard/payment-received-by-van/payment-received-by-van.component';
import { PaymentRequestApprovalComponent } from '@features/dashboard/payment-request-approval/payment-request-approval.component';
import { PaymentStatusComponent } from '@features/dashboard/payment-status/payment-status.component';
import { QrStatusComponent } from '@features/dashboard/qr-status/qr-status.component';
import { VANExpiryStatusComponent } from '@features/dashboard/vanexpiry-status/vanexpiry-status.component';
import { PaymentErpUpdateComponent } from '@features/dashboard/payment-erp-update/payment-erp-update.component';
const routes: Routes = [
  {
    path: 'qrGenerated',
    loadComponent: () => import('@features/dashboard/qr-generated/qr-generated.component').then(m => m.QrGeneratedComponent),
  },
  {
    path: 'vpaDeactivation',
    loadComponent: () => import('@features/dashboard/vpa-creation/vpa-creation.component').then(m => m.VpaCreationComponent),
    data: { deactivation: true },
  },
  {
    path: 'vpaCreation',
    loadComponent: () => import('@features/dashboard/vpa-creation/vpa-creation.component').then(m => m.VpaCreationComponent),
  },
  {
    path: 'singlePayment',
    loadComponent: () => import('@features/dashboard/payment-services/payment-services.component').then(m => m.PaymentServicesComponent),
    data: { service: 'single' },
  },
  {
    path: 'bulkPayment',
    loadComponent: () => import('@features/dashboard/payment-services/payment-services.component').then(m => m.PaymentServicesComponent),
    data: { service: 'bulk' },
  },
  {
    path: 'vpa',
    loadComponent: () => import('@features/dashboard/payment-services/payment-services.component').then(m => m.PaymentServicesComponent),
    data: { service: 'vpa' },
  },
  { path: 'paymentErpUpdate', component: PaymentErpUpdateComponent },
  { path: 'bulkPaymentInitialize', component: BulkPaymentInitializeComponent },
  { path: 'bulkPaymentStatus', component: BulkPaymentStatusComponent },
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
