import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AccountStatementComponent } from '@features/settings/account-statement/account-statement.component';
import { BalanceInquiryComponent } from '@features/settings/balance-inqury/balance-inqury.component';
import { ConfDashboardComponent } from '@features/settings/configuration/conf-dashboard/conf-dashboard.component';
import { ConfDetailComponent } from '@features/settings/configuration/conf-detail/conf-detail.component';
import { BatchInquiryComponent } from '@features/settings/push-checker-maker/batch-inquiry/batch-inquiry.component';
import { BatchStatusComponent } from '@features/settings/push-checker-maker/batch-status/batch-status.component';
import { PushCheckerMakerComponent } from '@features/settings/push-checker-maker/push-checker-maker.component';
import { PushInitComponent } from '@features/settings/push-checker-maker/push-init/push-init.component';
import { pushMakerComponent } from '@features/settings/push-checker-maker/push-maker/push-maker.component';
import { UserMgtDashboardComponent } from '@features/settings/userManagement/user-mgt-dashboard/user-mgt-dashboard.component';
import { VanModifyComponent } from '@features/settings/van-modify/van-modify.component';
import { VanRetrieveComponent } from '@features/settings/van-retrieve/van-retrieve.component';
import { VanCreationDashboardComponent } from '@features/settings/vanCreation/van-creation-dashboard/van-creation-dashboard.component';
import { VanCreationEditComponent } from '@features/settings/vanCreation/van-creation-edit/van-creation-edit.component';

const routes: Routes = [
  {
    path: 'confDashboard',
    component: ConfDashboardComponent,
  },
  {
    path: 'confDetails',
    component: ConfDetailComponent,
  },
  {
    path: 'userMgtDashboard',
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
