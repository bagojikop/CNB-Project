import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BalanceInquiryComponent } from '@features/settings/balance-inqury/balance-inqury.component';
import { ConfDashboardComponent } from '@features/settings/configuration/conf-dashboard/conf-dashboard.component';
import { ConfDetailComponent } from '@features/settings/configuration/conf-detail/conf-detail.component';
import { UserMgtDashboardComponent } from '@features/settings/userManagement/user-mgt-dashboard/user-mgt-dashboard.component';
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class settingsRoutingModule {}
