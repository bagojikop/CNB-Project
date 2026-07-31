import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  {
    path: 'payment-request-Approval',
    loadComponent: () =>
      import('@features/dashboard/payment-request-approval/payment-request-approval.component').then(
        (m) => m.PaymentRequestApprovalComponent,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
