import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconModule } from '@coreui/icons-angular';
import { cilArrowRight, cilBank, cilCalendar, cilFile, cilPlus } from '@coreui/icons';

@Component({
  selector: 'app-virtual-accounts',
  standalone: true,
  imports: [RouterLink, IconModule],
  templateUrl: './virtual-accounts.component.html',
  styleUrl: './virtual-accounts.component.scss',
})
export class VirtualAccountsComponent {
  readonly icons = { bank: cilBank, arrow: cilArrowRight };
  readonly services = [
    {
      title: 'Creation', category: 'GET STARTED', theme: 'blue', icon: cilPlus,
      description: 'Create virtual accounts linked to your bank account and manage pending creation requests.',
      details: ['Review creation requests', 'Create and track virtual accounts'],
      action: 'Manage creation', route: '/settings-form/vanCreationDashboard',
    },
    {
      title: 'Expiry Extend', category: 'KEEP ACCOUNTS ACTIVE', theme: 'amber', icon: cilCalendar,
      description: 'Review virtual accounts nearing expiry and extend their validity for continued collections.',
      details: ['Review upcoming expiries', 'Update account expiry dates'],
      action: 'Extend expiry', route: '/settings-form/vanModify',
    },
    {
      title: 'Statement', category: 'VIEW ACTIVITY', theme: 'teal', icon: cilFile,
      description: 'View transaction activity for a bank account or a specific virtual account over your chosen period.',
      details: ['Filter by account and date', 'Review transaction details'],
      action: 'View statement', route: '/settings-form/vanTransaction',
    },
  ];
}
