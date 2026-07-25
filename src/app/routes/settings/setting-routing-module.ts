import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfDashboardComponent } from '@features/settings/configuration/conf-dashboard/conf-dashboard.component';
import { ConfDetailComponent } from '@features/settings/configuration/conf-detail/conf-detail.component';
import { UserMgtDashboardComponent } from '@features/settings/userManagement/user-mgt-dashboard/user-mgt-dashboard.component';

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class settingsRoutingModule {}
