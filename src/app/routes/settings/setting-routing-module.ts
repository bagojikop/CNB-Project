import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { adminGuard } from '../../shared/services/auth.guard';

import { AccountStatementComponent } from '@features/settings/account-statement/account-statement.component';
import { BalanceInquiryComponent } from '@features/settings/balance-inqury/balance-inqury.component';
import { BankAccountDashboardComponent } from '@features/settings/bankAccount/bankAccount-dashboard/bankAccount-dashboard.component';
import { BankAccountDetailComponent } from '@features/settings/bankAccount/bankAccount-detail/bankAccount-detail.component';
import { BatchInquiryComponent } from '@features/settings/push-checker-maker/batch-inquiry/batch-inquiry.component';
import { BatchStatusComponent } from '@features/settings/push-checker-maker/batch-status/batch-status.component';
import { PushCheckerMakerComponent } from '@features/settings/push-checker-maker/push-checker-maker.component';
import { PushInitComponent } from '@features/settings/push-checker-maker/push-init/push-init.component';
import { pushMakerComponent } from '@features/settings/push-checker-maker/push-maker/push-maker.component';
import { UserMgtDashboardComponent } from '@features/settings/userManagement/user-mgt-dashboard/user-mgt-dashboard.component';
import { VanModifyComponent } from '@features/settings/van-modify/van-modify.component';
import { VanRetrieveComponent } from '@features/settings/van-retrieve/van-retrieve.component';
import { VanTransactionComponent } from '@features/settings/van-transaction/van-transaction.component';
import { VanCreationDashboardComponent } from '@features/settings/vanCreation/van-creation-dashboard/van-creation-dashboard.component';
import { VanCreationEditComponent } from '@features/settings/vanCreation/van-creation-edit/van-creation-edit.component';

const routes: Routes = [
  {
    path: 'virtualAccounts',
    loadComponent: () => import('@features/settings/virtual-accounts/virtual-accounts.component').then(m => m.VirtualAccountsComponent),
  },
  {
    path: 'bankAccountDashboard',
    canActivate: [adminGuard],
    component: BankAccountDashboardComponent,
  },
  {
    path: 'bankAccountDetails',
    canActivate: [adminGuard],
    component: BankAccountDetailComponent,
  },
  {
    path: 'userMgtDashboard',
    canActivate: [adminGuard],
    component: UserMgtDashboardComponent,
  },
  {
    path: 'vanCreationDashboard',
    component: VanCreationDashboardComponent,
  },
  {
    path: 'vanCreationEdit',
    component: VanCreationEditComponent,
  },
  {
    path: 'BalanceInquiry',
    component: BalanceInquiryComponent,
  },
  {
    path: 'vanRetrieve',
    component: VanRetrieveComponent,
  },
  {
    path: 'vanTransaction',
    component: VanTransactionComponent,
  },
  {
    path: 'vanModify',
    component: VanModifyComponent,
  },
  {
    path: 'accStatement',
    component: AccountStatementComponent,
  },
  {
    path: 'pushCheckerMaker',
    component: PushCheckerMakerComponent,
    children: [
      {
        path: 'pushMaker',
        component: pushMakerComponent,
      },
      {
        path: 'pushInit',
        component: PushInitComponent,
      },
      {
        path: 'batchStatus',
        component: BatchStatusComponent,
      },
      {
        path: 'batchEnquiry',
        component: BatchInquiryComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class settingsRoutingModule {}
